import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../@types/product';

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  getCount: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (!get().isInWishlist(product.id)) {
          set({ items: [...get().items, product] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.id !== productId) });
      },

      toggleItem: (product) => {
        if (get().isInWishlist(product.id)) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },

      isInWishlist: (productId) => get().items.some(i => i.id === productId),

      getCount: () => get().items.length,
    }),
    { name: 'skinvault-wishlist' }
  )
);
