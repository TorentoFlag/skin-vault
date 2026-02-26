import { useEffect } from 'react';
import { useItemsStore } from '../store/useItemsStore';
import type { FetchItemsParams } from '../api/items';

export function useProductsInit() {
  const loadItems = useItemsStore(s => s.loadItems);
  const items = useItemsStore(s => s.items);

  useEffect(() => {
    if (items.length === 0) {
      loadItems({ limit: 100, sort: 'price', order: 'desc' });
    }
  }, [loadItems, items.length]);
}

export function useProducts(params?: FetchItemsParams) {
  const items = useItemsStore(s => s.items);
  const isLoading = useItemsStore(s => s.isLoading);
  const error = useItemsStore(s => s.error);
  const loadItems = useItemsStore(s => s.loadItems);

  const retry = () => loadItems(params ?? { limit: 100, sort: 'price', order: 'desc' });

  return { products: items, isLoading, error, retry };
}
