import { motion } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import type { Product } from '../../../@types';
import { useWishlistStore } from '../../../store/useWishlistStore';
import toast from 'react-hot-toast';

interface WishlistButtonProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function WishlistButton({ product, size = 'md', showLabel = false }: WishlistButtonProps) {
  const isInWishlist = useWishlistStore(s => s.isInWishlist(product.id));
  const toggleItem = useWishlistStore(s => s.toggleItem);

  const iconSize = size === 'sm' ? 14 : size === 'md' ? 18 : 22;
  const padding = size === 'sm' ? 'p-1.5' : 'p-2';

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    if (!isInWishlist) {
      toast.success(`Добавлено в избранное`, {
        style: { background: '#1a1a2e', color: '#fff', border: '1px solid #3a3a5a' },
        iconTheme: { primary: '#ff6b6b', secondary: '#000' },
      });
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={handleToggle}
      className={`${padding} rounded-lg bg-[#1a1a2e]/80 border border-[#3a3a5a] hover:border-[#ff6b6b] transition-all flex items-center gap-1.5 backdrop-blur-sm`}
      title={isInWishlist ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      <motion.div
        animate={{ scale: isInWishlist ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        {isInWishlist
          ? <FaHeart size={iconSize} className="text-[#ff6b6b]" />
          : <FiHeart size={iconSize} className="text-[#a0a0b0] hover:text-[#ff6b6b]" />
        }
      </motion.div>
      {showLabel && <span className={`text-sm ${isInWishlist ? 'text-[#ff6b6b]' : 'text-[#a0a0b0]'}`}>{isInWishlist ? 'В избранном' : 'В избранное'}</span>}
    </motion.button>
  );
}
