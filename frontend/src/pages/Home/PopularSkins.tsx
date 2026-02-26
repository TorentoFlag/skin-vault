import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { ProductCard } from '../../components/product/ProductCard/ProductCard';
import { useProducts } from '../../hooks/useProducts';
import { useTranslation } from 'react-i18next';

export function PopularSkins() {
  const { t } = useTranslation('home');
  const { products, error } = useProducts();
  if (error && products.length === 0) return null;
  const displayed = products.slice(0, 8);

  return (
    <>
      {/* Popular section */}
      <section className="py-16 px-6 max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold font-exo2 text-white">{t('popular.title')}</h2>
            <p className="text-[#6b6b7b] mt-1">{t('popular.subtitle')}</p>
          </div>
          <Link
            to="/marketplace"
            className="flex items-center gap-2 text-[#00d9ff] hover:gap-3 transition-all text-sm font-medium"
          >
            {t('common:actions.viewAll')} <FiArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 mobile-lg:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 gap-4">
          {displayed.slice(0, 8).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-8 pb-16 px-6 max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold font-exo2 text-white">
              {t('newArrivals.title')} <span className="gradient-text">{t('newArrivals.titleAccent')}</span>
            </h2>
            <p className="text-[#6b6b7b] mt-1">{t('newArrivals.subtitle')}</p>
          </div>
          <Link
            to="/marketplace"
            className="flex items-center gap-2 text-[#00d9ff] hover:gap-3 transition-all text-sm font-medium"
          >
            {t('common:actions.viewAll')} <FiArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 mobile-lg:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 gap-4">
          {products.slice(8, 14).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust section */}
      <section className="py-16 px-6 bg-[#1a1a2e]/50 border-y border-[#3a3a5a]">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 tablet:grid-cols-3 gap-6">
            {([
              { icon: '🔒', key: 'steamProtection' },
              { icon: '⚡', key: 'instantDelivery' },
              { icon: '💎', key: 'bestPrices' },
            ] as const).map(item => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex gap-4 p-6 bg-[#252540]/50 rounded-2xl border border-[#3a3a5a] hover:border-[#00d9ff]/30 transition"
              >
                <div className="text-4xl">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-white font-exo2 text-lg mb-1">{t(`trust.${item.key}.title`)}</h3>
                  <p className="text-[#6b6b7b] text-sm leading-relaxed">{t(`trust.${item.key}.desc`)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
