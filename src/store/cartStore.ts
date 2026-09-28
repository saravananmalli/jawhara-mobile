import { router } from 'expo-router';
import { create } from 'zustand';
import { api, CartApiRow, getAuthToken, Product } from '@/services/api';
import { usePendingActionStore } from './pendingActionStore';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: Record<string, CartItem>;
  loading: boolean;
  loadCart: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

function toItemsRecord(rows: CartApiRow[]): Record<string, CartItem> {
  const result: Record<string, CartItem> = {};
  for (const { quantity, ...product } of rows) {
    result[product._id] = { product, quantity };
  }
  return result;
}

/**
 * Backend-synced cart — same account, same cart on mobile and web. Guests
 * get redirected to login (the attempted add is replayed automatically once
 * they're in).
 */
export const useCartStore = create<CartState>((set, get) => ({
  items: {},
  loading: false,

  loadCart: async () => {
    if (!getAuthToken()) {
      set({ items: {} });
      return;
    }
    set({ loading: true });
    try {
      const rows = await api.getCart();
      set({ items: toItemsRecord(rows) });
    } catch {
      // keep whatever was already loaded on a transient failure
    } finally {
      set({ loading: false });
    }
  },

  addToCart: (product, quantity = 1) => {
    if (!getAuthToken()) {
      usePendingActionStore.getState().setAction(() => get().addToCart(product, quantity));
      router.push('/(auth)/login');
      return;
    }

    const existing = get().items[product._id];
    set((state) => ({
      items: {
        ...state.items,
        [product._id]: { product, quantity: (existing?.quantity ?? 0) + quantity },
      },
    }));

    api.addCartItem(product._id, quantity).catch(() => {
      set((state) => {
        const next = { ...state.items };
        if (existing) next[product._id] = existing;
        else delete next[product._id];
        return { items: next };
      });
    });
  },

  removeFromCart: (productId) => {
    const removed = get().items[productId];
    set((state) => {
      const next = { ...state.items };
      delete next[productId];
      return { items: next };
    });
    api.removeCartItem(productId).catch(() => {
      if (removed) set((state) => ({ items: { ...state.items, [productId]: removed } }));
    });
  },

  updateQuantity: (productId, quantity) => {
    const existing = get().items[productId];
    if (!existing) return;
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set((state) => ({
      items: { ...state.items, [productId]: { ...existing, quantity } },
    }));
    api.updateCartItemQuantity(productId, quantity).catch(() => {
      set((state) => ({ items: { ...state.items, [productId]: existing } }));
    });
  },

  clearCart: () => set({ items: {} }),
}));

// Fine-grained selector hooks — each subscribes to only what it needs, so a
// component that just wants to fire addToCart doesn't re-render on every
// quantity change elsewhere in the cart.
export function useCartItems() {
  return useCartStore((s) => s.items);
}

export function useCartCount() {
  return useCartStore((s) => Object.values(s.items).reduce((sum, i) => sum + i.quantity, 0));
}

export function useCartTotal() {
  return useCartStore((s) =>
    Object.values(s.items).reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  );
}

export function useCartActions() {
  const addToCart = useCartStore((s) => s.addToCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  return { addToCart, removeFromCart, updateQuantity, clearCart };
}

/** Combined hook mirroring the old CartContext shape, for screens that need reactive totals. */
export function useCart() {
  const items = useCartItems();
  const cartCount = useCartCount();
  const totalPrice = useCartTotal();
  const actions = useCartActions();
  return { items, itemList: Object.values(items), cartCount, totalPrice, ...actions };
}
