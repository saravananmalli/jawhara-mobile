import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Product } from '@/services/api';

const MAX_RECENT = 20;

interface RecentlyViewedState {
  ids: string[];
  products: Record<string, Product>;
  addViewed: (product: Product) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      ids: [],
      products: {},
      addViewed: (product) =>
        set((state) => {
          const ids = [product._id, ...state.ids.filter((id) => id !== product._id)].slice(
            0,
            MAX_RECENT,
          );
          const products: Record<string, Product> = { [product._id]: product };
          for (const id of ids) {
            if (id !== product._id && state.products[id]) products[id] = state.products[id];
          }
          return { ids, products };
        }),
      clear: () => set({ ids: [], products: {} }),
    }),
    {
      name: 'jawhara-recently-viewed',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ ids: state.ids, products: state.products }),
    },
  ),
);

/** `excludeId` omits the product currently being viewed from its own PDP's list. */
export function useRecentlyViewed(excludeId?: string) {
  const ids = useRecentlyViewedStore((s) => s.ids);
  const products = useRecentlyViewedStore((s) => s.products);
  const addViewed = useRecentlyViewedStore((s) => s.addViewed);
  const clear = useRecentlyViewedStore((s) => s.clear);

  const items = ids.filter((id) => id !== excludeId && products[id]).map((id) => products[id]);

  return { items, addViewed, clear };
}
