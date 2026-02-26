import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart } from 'react-icons/fi';
import type { Product } from '../../../@types';
import { useCartStore } from '../../../store/useCartStore';
import { useFormatPrice } from '../../../utils/formatPrice';
import { getRarityColor, getQualityColor } from '../../../utils/getRarityColor';
import { QualityBadge, StatTrakBadge, DiscountBadge, NewBadge } from '../../common/Badge/Badge';
import { WishlistButton } from '../../wishlist/WishlistButton/WishlistButton';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation('product');
  const { formatPrice } = useFormatPrice();
  const addItem = useCartStore(s => s.addItem);
  const rarityColor = getRarityColor(product.rarity);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(t('addedToCartName', { name: `${product.weapon} | ${product.name}` }), {
      style: { background: '#1a1a2e', color: '#fff', border: '1px solid #3a3a5a' },
      iconTheme: { primary: '#00ff88', secondary: '#000' },
    });
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="relative group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div
          className="bg-gradient-to-br from-[#252540] to-[#1f1f3a] rounded-2xl p-4 border border-[#3a3a5a] hover:border-opacity-60 transition-all duration-200 cursor-pointer h-full flex flex-col overflow-hidden"
          style={{
            '--rarity-glow': `${rarityColor}20`,
          } as React.CSSProperties}
        >
          {/* Rarity border top */}
          <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b-full" style={{ backgroundColor: rarityColor }} />

          {/* Badges top-left */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            {product.isNew && <NewBadge />}
            {product.statTrak && <StatTrakBadge />}
            {product.discount && <DiscountBadge discount={product.discount} />}
          </div>

          {/* Wishlist top-right */}
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <WishlistButton product={product} size="sm" />
          </div>

          {/* Image */}
          <div className="flex justify-center items-center mb-4 h-[160px] relative">
            <motion.img
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.2 }}
              src={product.image}
              alt={`${product.weapon} | ${product.name}`}
              className="w-[150px] h-[150px] object-contain drop-shadow-lg"
              loading="lazy"
            />
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col">
            <p className="text-[#a0a0b0] text-xs mb-0.5">{product.weapon}</p>
            <h3 className="text-white font-semibold text-sm mb-2 leading-tight line-clamp-1">
              {product.statTrak && <span className="text-[#e4ae39]">ST™ </span>}
              {product.name}
            </h3>

            {/* Quality badge */}
            <div className="flex items-center gap-2 mb-2">
              <QualityBadge quality={product.quality} />
              <span className="text-[#6b6b7b] text-xs">Float: {product.float.toFixed(4)}</span>
            </div>

            {/* Float bar */}
            <div className="h-1.5 rounded-full bg-[#1a1a2e] mb-3 overflow-hidden">
              <div
                className="h-full rounded-full float-bar"
                style={{ width: `${product.float * 100}%` }}
              />
            </div>

            {/* Price & Buy */}
            <div className="mt-auto flex items-end justify-between gap-2">
              <div className="min-w-0">
                <div
                  className="text-xl font-bold font-['Orbitron'] truncate"
                  style={{ color: getQualityColor(product.quality) }}
                >
                  {formatPrice(product.price)}
                </div>
                {product.originalPrice && (
                  <div className="text-xs text-[#6b6b7b] line-through">{formatPrice(product.originalPrice)}</div>
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#00d9ff] to-[#00ff88] px-3 py-2 rounded-lg text-black font-semibold text-xs hover:shadow-[0_0_15px_rgba(0,217,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 whitespace-nowrap"
              >
                <FiShoppingCart size={13} />
                {product.inStock ? t('common:actions.buy') : t('common:actions.sold')}
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
