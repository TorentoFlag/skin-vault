import { create } from 'zustand';
import type { Product } from '../@types';
import { fetchItems, type FetchItemsParams } from '../api/items';

interface ItemsState {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;

  loadItems: (params?: FetchItemsParams) => Promise<void>;
}

export const useItemsStore = create<ItemsState>()((set) => ({
  items: [],
  total: 0,
  page: 1,
  totalPages: 0,
  isLoading: false,
  error: null,

  loadItems: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchItems(params);
      set({
        items: data.items,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load items',
        isLoading: false,
      });
    }
  },
}));
