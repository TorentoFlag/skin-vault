import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiShoppingCart, FiExternalLink } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/product/ProductCard/ProductCard';
import { useCartStore } from '../../store/useCartStore';
import { WishlistButton } from '../../components/wishlist/WishlistButton/WishlistButton';
import { QualityBadge, RarityBadge, StatTrakBadge } from '../../components/common/Badge/Badge';
import { useFormatPrice } from '../../utils/formatPrice';
import { getRarityColor, getQualityColor, getQualityLabel } from '../../utils/getRarityColor';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function ProductDetail() {
  const { t } = useTranslation('product');
  const { formatPriceFull } = useFormatPrice();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products: allProducts } = useProducts();
  const product = allProducts.find(p => p.id === id);
  const addItem = useCartStore(s => s.addItem);
  const setCartOpen = useCartStore(s => s.setCartOpen);

  if (!product) {
    return (
      <div className="min-h-screen pt-page flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-white mb-2">{t('notFound.title')}</h2>
        <p className="text-[#6b6b7b] mb-6">{t('notFound.desc')}</p>
        <button onClick={() => navigate('/marketplace')} className="px-6 py-3 bg-gradient-to-r from-[#00d9ff] to-[#00ff88] rounded-xl text-black font-semibold">
          {t('notFound.action')}
        </button>
      </div>
    );
  }

  const rarityColor = getRarityColor(product.rarity);
  const qualityColor = getQualityColor(product.quality);

  function handleBuy() {
    addItem(product!);
    setCartOpen(true);
    toast.success(t('addedToCart'), {
      style: { background: '#1a1a2e', color: '#fff', border: '1px solid #3a3a5a' },
    });
  }

  const similarProducts = allProducts.filter(p => p.weapon === product.weapon && p.id !== product.id).slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-page pb-16 px-4 laptop:px-8"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-[#6b6b7b] mb-6">
          <Link to="/" className="hover:text-[#00d9ff] transition">{t('breadcrumbs.home')}</Link>
          <span>/</span>
          <Link to="/marketplace" className="hover:text-[#00d9ff] transition">{t('breadcrumbs.marketplace')}</Link>
          <span>/</span>
          <span className="text-[#a0a0b0]">{product.weapon} | {product.name}</span>
        </div>

        {/* Back button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#a0a0b0] hover:text-white transition mb-6">
          <FiArrowLeft size={16} /> {t('common:actions.back')}
        </button>

        {/* Main layout */}
        <div className="grid grid-cols-1 laptop:grid-cols-[1fr_1fr] gap-8 mb-12">
          {/* Image section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#252540] to-[#1f1f3a] rounded-2xl border border-[#3a3a5a] p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]"
          >
            {/* Rarity glow bg */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${rarityColor} 0%, transparent 70%)` }} />

            <motion.img
              whileHover={{ scale: 1.05, rotate: 1 }}
              transition={{ duration: 0.3 }}
              src={product.image}
              alt={`${product.weapon} | ${product.name}`}
              className="w-[300px] h-[300px] object-contain drop-shadow-2xl"
            />

            {/* Rarity line */}
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: rarityColor }} />
          </motion.div>

          {/* Info section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col gap-5"
          >
            {/* Title */}
            <div>
              <p className="text-[#a0a0b0] text-sm mb-1">{product.weapon}</p>
              <h1 className="text-3xl laptop:text-4xl font-bold font-exo2 text-white leading-tight">
                {product.statTrak && <span className="text-[#e4ae39]">StatTrak™ </span>}
                {product.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <QualityBadge quality={product.quality} />
                <RarityBadge rarity={product.rarity} />
                {product.statTrak && <StatTrakBadge />}
                {!product.inStock && (
                  <span className="px-2 py-0.5 bg-[#ff4444]/20 text-[#ff4444] text-xs rounded-md border border-[#ff4444]/30">{t('common:product.outOfStock')}</span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="p-4 bg-[#1a1a2e] rounded-xl border border-[#3a3a5a]">
              <div className="text-4xl font-bold font-['Orbitron']" style={{ color: qualityColor }}>
                {formatPriceFull(product.price)}
              </div>
              {product.originalPrice && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[#6b6b7b] line-through text-sm">{formatPriceFull(product.originalPrice)}</span>
                  <span className="text-[#00ff88] text-sm font-medium">{t('off', { discount: product.discount })}</span>
                </div>
              )}
            </div>

            {/* Characteristics */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t('characteristics.condition'), value: getQualityLabel(product.quality) },
                { label: t('characteristics.floatValue'), value: product.float.toFixed(6) },
                { label: t('characteristics.rarity'), value: product.rarity },
                { label: t('characteristics.collection'), value: product.collection || t('common:product.unknown') },
              ].map(item => (
                <div key={item.label} className="p-3 bg-[#252540] rounded-xl border border-[#3a3a5a]">
                  <div className="text-xs text-[#6b6b7b] mb-1">{item.label}</div>
                  <div className="text-sm text-white font-medium">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Float bar */}
            <div>
              <div className="flex items-center justify-between text-xs text-[#6b6b7b] mb-2">
                <span>Float: {product.float.toFixed(6)}</span>
                <span style={{ color: qualityColor }}>{getQualityLabel(product.quality)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#1a1a2e] overflow-hidden relative">
                <div className="h-full rounded-full float-bar" style={{ width: '100%' }} />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-[#0f0f1a] shadow-lg"
                  style={{ left: `calc(${product.float * 100}% - 6px)` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#6b6b7b] mt-1">
                <span>0.00 FN</span>
                <span>0.07 MW</span>
                <span>0.15 FT</span>
                <span>0.38 WW</span>
                <span>0.45 BS</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleBuy}
                disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#00d9ff] to-[#00ff88] py-4 rounded-xl text-black font-bold text-lg hover:shadow-[0_0_25px_rgba(0,217,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiShoppingCart size={20} />
                {product.inStock ? t('buyFor', { price: formatPriceFull(product.price) }) : t('common:product.outOfStock')}
              </motion.button>
              <WishlistButton product={product} size="lg" />
            </div>

            {/* Availability */}
            {product.inStock && (
              <p className="text-[#00ff88] text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
                {t('inStockDelivery')}
              </p>
            )}

            {/* Steam link */}
            <a href="#" className="flex items-center gap-2 text-[#6b6b7b] hover:text-[#00d9ff] transition text-sm">
              <FiExternalLink size={14} /> {t('common:actions.viewOnSteam')}
            </a>
          </motion.div>
        </div>

        {/* Price Chart */}
        {product.priceHistory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12 p-6 bg-[#1a1a2e] rounded-2xl border border-[#3a3a5a]"
          >
            <h2 className="text-xl font-bold font-exo2 text-white mb-6">{t('priceHistory')}</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={product.priceHistory}>
                <XAxis dataKey="date" tick={{ fill: '#6b6b7b', fontSize: 11 }} tickLine={false} axisLine={false} interval={6} />
                <YAxis tick={{ fill: '#6b6b7b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => formatPriceFull(v)} />
                <Tooltip
                  contentStyle={{ background: '#252540', border: '1px solid #3a3a5a', borderRadius: '8px', color: '#fff' }}
                  formatter={(val: number | undefined) => [formatPriceFull(val ?? 0), t('priceLabel')]}
                />
                <Line type="monotone" dataKey="price" stroke="#00d9ff" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#00d9ff' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Similar skins */}
        {similarProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold font-exo2 text-white mb-6">{t('similarSkins')}</h2>
            <div className="grid grid-cols-2 laptop:grid-cols-4 gap-4">
              {similarProducts.map(p => (
                <div key={p.id}><ProductCard product={p} /></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
