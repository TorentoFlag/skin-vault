import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../@types/product';
import type { CartItem } from '../@types/cart';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product) => {
        const items = get().items;
        const existing = items.find(i => i.product.id === product.id);
        if (existing) {
          if (existing.quantity >= 1) return;
          set({ items: items.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) });
        } else {
          set({ items: [...items, { product, quantity: 1 }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.product.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        if (quantity > 1) return;
        set({ items: get().items.map(i => i.product.id === productId ? { ...i, quantity } : i) });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      toggleCart: () => set({ isOpen: !get().isOpen }),

      setCartOpen: (open) => set({ isOpen: open }),
    }),
    { name: 'skinvault-cart' }
  )
);
