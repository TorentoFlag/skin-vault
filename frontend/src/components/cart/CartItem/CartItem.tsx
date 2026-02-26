import { motion } from 'framer-motion';
import { FiTrash2 } from 'react-icons/fi';
import type { CartItem as CartItemType } from '../../../@types';
import { useCartStore } from '../../../store/useCartStore';
import { useFormatPrice } from '../../../utils/formatPrice';
import { QualityBadge } from '../../common/Badge/Badge';

interface CartItemProps {
  item: CartItemType;
}

export function CartItemComponent({ item }: CartItemProps) {
  const { formatPrice } = useFormatPrice();
  const { removeItem } = useCartStore();
  const { product } = item;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-4 p-4 bg-[#252540] rounded-xl border border-[#3a3a5a]"
    >
      {/* Image */}
      <img
        src={product.image}
        alt={product.name}
        className="w-16 h-16 object-contain flex-shrink-0 rounded-lg bg-[#1a1a2e] p-1"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[#a0a0b0] text-xs">{product.weapon}</p>
        <p className="text-white text-sm font-medium truncate">
          {product.statTrak && <span className="text-[#e4ae39]">ST™ </span>}
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <QualityBadge quality={product.quality} />
          <span className="text-xs text-[#6b6b7b]">Float: {product.float.toFixed(4)}</span>
        </div>
      </div>

      {/* Price */}
      <div className="text-right ml-2">
        <div className="text-[#00ff88] font-bold font-['Orbitron'] text-sm">{formatPrice(product.price)}</div>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(product.id)}
        className="p-1.5 text-[#6b6b7b] hover:text-[#ff6b6b] transition ml-1"
      >
        <FiTrash2 size={15} />
      </button>
    </motion.div>
  );
}
