import { create } from 'zustand';

interface PendingActionState {
  action: (() => void) | null;
  setAction: (action: (() => void) | null) => void;
}

/**
 * Holds a single deferred action (e.g. "add this product to the wishlist")
 * captured when a guest is redirected to login. Consumed once, right after
 * a successful login/register, then cleared.
 */
export const usePendingActionStore = create<PendingActionState>((set) => ({
  action: null,
  setAction: (action) => set({ action }),
}));
