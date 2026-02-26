import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { SiSteam } from 'react-icons/si';
import { useCartStore } from '../../store/useCartStore';
import { CartItemComponent } from '../../components/cart/CartItem/CartItem';
import { useFormatPrice } from '../../utils/formatPrice';
import { useAuthStore } from '../../store/useAuthStore';
import { getSteamLoginUrl } from '../../api/auth';
import { useTranslation } from 'react-i18next';

export function Cart() {
  const { t } = useTranslation('cart');
  const { formatPriceFull } = useFormatPrice();
  const { items, clearCart, getTotal } = useCartStore();
  const total = getTotal();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-page pb-16 px-4 laptop:px-8"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-exo2 text-white">{t('title')}</h1>
            <p className="text-[#6b6b7b] mt-1">{t('common:item', { count: items.length })}</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="flex items-center gap-2 text-[#ff6b6b] hover:text-white transition text-sm"
            >
              <FiTrash2 size={14} /> {t('common:actions.clearCart')}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="text-7xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('empty.title')}</h2>
            <p className="text-[#6b6b7b] mb-8">{t('empty.descPage')}</p>
            <Link
              to="/marketplace"
              className="flex items-center gap-2 bg-gradient-to-r from-[#00d9ff] to-[#00ff88] px-8 py-3 rounded-xl text-black font-bold hover:shadow-[0_0_25px_rgba(0,217,255,0.4)] transition-all"
            >
              <FiShoppingCart size={18} /> {t('common:actions.goToShop')}
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 laptop:grid-cols-[1fr_340px] gap-6">
            {/* Items */}
            <div className="space-y-3">
              <AnimatePresence>
                {items.map(item => <CartItemComponent key={item.product.id} item={item} />)}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="h-fit sticky top-[90px]">
              <div className="bg-[#1a1a2e] rounded-2xl border border-[#3a3a5a] p-6 space-y-4">
                <h2 className="font-bold text-white font-exo2 text-xl">{t('orderSummary')}</h2>

                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-[#a0a0b0] truncate max-w-[180px]">
                        {item.product.weapon} | {item.product.name}
                      </span>
                      <span className="text-white font-medium">{formatPriceFull(item.product.price)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#3a3a5a] pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#a0a0b0]">{t('subtotal')}</span>
                    <span className="text-white">{formatPriceFull(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#a0a0b0]">{t('commission')}</span>
                    <span className="text-[#00ff88]">{t('free')}</span>
                  </div>
                </div>

                <div className="border-t border-[#3a3a5a] pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white text-lg">{t('total')}</span>
                    <span className="text-[#00ff88] font-bold text-2xl font-['Orbitron']">{formatPriceFull(total)}</span>
                  </div>
                </div>

                {isAuthenticated ? (
                  <button
                    disabled
                    className="w-full py-4 bg-gradient-to-r from-[#00d9ff] to-[#00ff88] rounded-xl text-black font-bold text-lg transition-all opacity-40 cursor-not-allowed"
                  >
                    {t('buyNow')}
                  </button>
                ) : (
                  <button
                    onClick={() => { window.location.href = getSteamLoginUrl(); }}
                    className="w-full py-4 bg-gradient-to-r from-[#00d9ff] to-[#00ff88] rounded-xl text-black font-bold text-lg hover:shadow-[0_0_25px_rgba(0,217,255,0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    <SiSteam size={20} />
                    {t('checkoutSteam')}
                  </button>
                )}

                <div className="flex flex-col gap-2 pt-2">
                  {[
                    { icon: '🔒', key: 'steamProtection' },
                    { icon: '⚡', key: 'instantDelivery' },
                    { icon: '💳', key: 'securePayment' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center gap-2 text-xs text-[#6b6b7b]">
                      <span>{item.icon}</span> {t(`trust.${item.key}`)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
