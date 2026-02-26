import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import { ProductCard } from '../../components/product/ProductCard/ProductCard';
import { useFormatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function Wishlist() {
  const { t } = useTranslation('wishlist');
  const { formatPriceFull } = useFormatPrice();
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore(s => s.addItem);

  function handleAddAllToCart() {
    const inStockItems = items.filter(p => p.inStock);
    inStockItems.forEach(p => addToCart(p));
    toast.success(t('common:item', { count: inStockItems.length }) + ' ' + t('common:actions.addAllToCart').toLowerCase(), {
      style: { background: '#1a1a2e', color: '#fff', border: '1px solid #3a3a5a' },
    });
  }

  const totalValue = items.reduce((sum, p) => sum + p.price, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-page pb-16 px-4 laptop:px-8"
    >
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-exo2 text-white flex items-center gap-3">
              <FiHeart className="text-[#ff6b6b]" size={28} />
              {t('title')}
            </h1>
            <p className="text-[#6b6b7b] mt-1">
              {t('common:skin', { count: items.length })} {t('saved')}
              {items.length > 0 && ` • ${t('totalValue', { value: formatPriceFull(totalValue) })}`}
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleAddAllToCart}
                className="flex items-center gap-2 bg-gradient-to-r from-[#00d9ff] to-[#00ff88] px-5 py-2.5 rounded-xl text-black font-semibold hover:shadow-[0_0_20px_rgba(0,217,255,0.4)] transition"
              >
                <FiShoppingCart size={16} /> {t('common:actions.addAllToCart')}
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="text-7xl mb-6">💔</div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('empty.title')}</h2>
            <p className="text-[#6b6b7b] mb-8">{t('empty.desc')}</p>
            <Link
              to="/marketplace"
              className="flex items-center gap-2 bg-gradient-to-r from-[#ff6b6b] to-[#ff44ff] px-8 py-3 rounded-xl text-white font-bold hover:shadow-[0_0_25px_rgba(255,107,107,0.4)] transition-all"
            >
              <FiHeart size={18} /> {t('common:actions.browseSkins')}
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 mobile-lg:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 desktop-xl:grid-cols-5 gap-4">
            {items.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04 }}
                className="relative group"
              >
                <ProductCard product={product} />
                <button
                  onClick={() => removeItem(product.id)}
                  className="absolute top-3 left-3 z-20 p-1.5 bg-[#ff4444]/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title={t('common:actions.removeFromWishlist')}
                >
                  <FiTrash2 size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
