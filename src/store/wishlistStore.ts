import { router } from 'expo-router';
import { useMemo } from 'react';
import { create } from 'zustand';
import { api, getAuthToken, Product } from '@/services/api';
import { usePendingActionStore } from './pendingActionStore';

interface WishlistState {
  items: Record<string, Product>;
  loading: boolean;
  loadWishlist: () => Promise<void>;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

/**
 * Backend-synced wishlist — the server is the source of truth so the same
 * account sees the same wishlist on mobile and web. Guests get redirected to
 * login (the attempted toggle is replayed automatically once they're in).
 */
export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: {},
  loading: false,

  loadWishlist: async () => {
    if (!getAuthToken()) {
      set({ items: {} });
      return;
    }
    set({ loading: true });
    try {
      const products = await api.getWishlist();
      set({ items: Object.fromEntries(products.map((p) => [p._id, p])) });
    } catch {
      // keep whatever was already loaded on a transient failure
    } finally {
      set({ loading: false });
    }
  },

  toggleWishlist: (product) => {
    if (!getAuthToken()) {
      usePendingActionStore.getState().setAction(() => get().toggleWishlist(product));
      router.push('/(auth)/login');
      return;
    }

    const alreadyWishlisted = !!get().items[product._id];
    set((state) => {
      const next = { ...state.items };
      if (alreadyWishlisted) delete next[product._id];
      else next[product._id] = product;
      return { items: next };
    });

    const request = alreadyWishlisted
      ? api.removeWishlistItem(product._id)
      : api.addWishlistItem(product._id);

    request.catch(() => {
      // revert the optimistic update if the backend call failed
      set((state) => {
        const next = { ...state.items };
        if (alreadyWishlisted) next[product._id] = product;
        else delete next[product._id];
        return { items: next };
      });
    });
  },

  removeFromWishlist: (productId) => {
    if (!getAuthToken()) return;
    const removed = get().items[productId];
    set((state) => {
      const next = { ...state.items };
      delete next[productId];
      return { items: next };
    });
    api.removeWishlistItem(productId).catch(() => {
      if (removed) {
        set((state) => ({ items: { ...state.items, [productId]: removed } }));
      }
    });
  },

  clearWishlist: () => set({ items: {} }),
}));

export function useWishlistItems() {
  return useWishlistStore((s) => s.items);
}

export function useWishlistCount() {
  return useWishlistStore((s) => Object.keys(s.items).length);
}

/** Combined hook mirroring the old WishlistContext shape (Set-based `wishlist.has(id)` checks). */
export function useWishlist() {
  const items = useWishlistItems();
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);

  const wishlist = useMemo(() => new Set(Object.keys(items)), [items]);

  return {
    items,
    itemList: Object.values(items),
    wishlist,
    wishlistCount: wishlist.size,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
  };
}
