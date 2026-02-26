import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '../../../@types';
import { ProductCard } from '../ProductCard/ProductCard';
import { ProductCardSkeleton } from '../../common/Skeleton/Skeleton';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  columns?: 2 | 3 | 4 | 5;
}

export function ProductGrid({ products, loading = false }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 mobile-lg:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 desktop-xl:grid-cols-5 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-white mb-2">Скины не найдены</h3>
        <p className="text-[#6b6b7b] text-sm">Попробуйте изменить фильтры или поисковый запрос</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 mobile-lg:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 desktop-xl:grid-cols-5 gap-4 overflow-hidden">
      <AnimatePresence mode="sync">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.5) }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
