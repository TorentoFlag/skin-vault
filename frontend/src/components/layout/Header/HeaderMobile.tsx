import { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiSearch, FiShoppingCart, FiHeart, FiHome, FiGrid, FiHelpCircle, FiLogOut } from 'react-icons/fi';
import { SiSteam } from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../../store/useCartStore';
import { useWishlistStore } from '../../../store/useWishlistStore';
import { useFilterStore } from '../../../store/useFilterStore';
import { useProducts } from '../../../hooks/useProducts';
import type { Product } from '../../../@types';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../../common/LanguageSwitcher/LanguageSwitcher';
import { CurrencySwitcher } from '../../common/CurrencySwitcher/CurrencySwitcher';
import { useFormatPrice } from '../../../utils/formatPrice';
import { useAuthStore } from '../../../store/useAuthStore';
import { getSteamLoginUrl } from '../../../api/auth';

const RARITY_COLORS: Record<string, string> = {
  Covert: '#ff4444',
  Classified: '#ff44ff',
  Restricted: '#aa44ff',
  'Mil-Spec': '#4444ff',
  Industrial: '#44aaff',
  Consumer: '#b0c3d9',
  Contraband: '#ffa500',
};

export function HeaderMobile() {
  const { t } = useTranslation();
  const { formatPrice } = useFormatPrice();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const cartCount = useCartStore(s => s.getCount());
  const wishlistCount = useWishlistStore(s => s.getCount());
  const toggleCart = useCartStore(s => s.toggleCart);
  const setSearchQuery = useFilterStore(s => s.setSearchQuery);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { products } = useProducts();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const suggestions = useMemo<Product[]>(() => {
    const q = inputVal.trim().toLowerCase();
    if (q.length < 2) return [];
    return products
      .filter(p => {
        const full = `${p.weapon} | ${p.name}`.toLowerCase();
        return full.includes(q) || p.weapon.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
      })
      .slice(0, 5);
  }, [inputVal]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setSearchQuery(inputVal);
    navigate('/marketplace');
    setSearchOpen(false);
    setInputVal('');
  }

  function handleSuggestionClick(product: Product) {
    setInputVal('');
    setSearchOpen(false);
    navigate(`/product/${product.id}`);
  }


  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-[#0f0f1a]/90 backdrop-blur-md z-50 border-b border-[#3a3a5a] safe-top">
        <div className="flex items-center justify-between px-4 h-[60px]">
          <Link to="/" className="text-xl font-bold font-exo2 bg-gradient-to-r from-[#00d9ff] to-[#00ff88] bg-clip-text text-transparent">
            SkinVault
          </Link>

          <div className="flex items-center gap-1">
            {pathname !== '/marketplace' && (
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-[#a0a0b0] hover:text-white">
                <FiSearch size={20} />
              </button>
            )}
            <Link to="/wishlist" className="relative p-2 text-[#a0a0b0] hover:text-[#ff6b6b]">
              <FiHeart size={20} />
              {wishlistCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-[#ff6b6b] text-white text-[10px] rounded-full flex items-center justify-center">{wishlistCount}</span>}
            </Link>
            <button onClick={toggleCart} className="relative p-2 text-[#a0a0b0] hover:text-[#00d9ff]">
              <FiShoppingCart size={20} />
              {cartCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-[#00d9ff] text-black text-[10px] rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-[#a0a0b0] hover:text-white">
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-[#3a3a5a] bg-[#0f0f1a]/95 overflow-hidden"
            >
              <form onSubmit={handleSearch} className="p-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b7b]" size={16} />
                  <input
                    autoFocus
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => e.key === 'Escape' && (setSearchOpen(false), setInputVal(''))}
                    className="w-full bg-[#1a1a2e] border border-[#3a3a5a] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#6b6b7b] focus:border-[#00d9ff] outline-none"
                    placeholder={t('search.placeholder')}
                  />
                </div>
              </form>

              {inputVal.trim().length >= 2 && (
                <div className="border-t border-[#2a2a3a]">
                  {suggestions.length > 0 ? suggestions.map(product => (
                    <button
                      key={product.id}
                      onClick={() => handleSuggestionClick(product)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#252540] transition-colors text-left"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-9 h-9 rounded-md object-cover bg-[#252540] flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-medium truncate">
                          {product.weapon}{' '}
                          <span className="text-[#a0a0b0]">| {product.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-[10px] font-medium"
                            style={{ color: RARITY_COLORS[product.rarity] ?? '#a0a0b0' }}
                          >
                            {product.rarity}
                          </span>
                          <span className="text-[10px] text-[#6b6b7b]">{product.quality}</span>
                        </div>
                      </div>
                      <span className="text-[#00d9ff] text-sm font-bold flex-shrink-0">
                        {formatPrice(product.price)}
                      </span>
                    </button>
                  )) : (
                    <div className="px-4 py-5 text-center">
                      <FiSearch className="mx-auto mb-2 text-[#6b6b7b]" size={20} />
                      <p className="text-sm text-[#6b6b7b]">{t('search.noResults', { query: inputVal.trim() })}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40" onClick={() => setMenuOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-72 bg-[#1a1a2e] border-l border-[#3a3a5a] z-50 flex flex-col"
            >
              <div className="p-5 border-b border-[#3a3a5a]">
                <div className="flex items-center justify-between">
                  <span className="font-exo2 text-xl font-bold gradient-text">SkinVault</span>
                  <button onClick={() => setMenuOpen(false)} className="text-[#a0a0b0]"><FiX size={22} /></button>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <LanguageSwitcher />
                  <CurrencySwitcher />
                </div>
              </div>

              <nav className="flex-1 p-5 flex flex-col gap-2">
                <Link to="/" onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl hover:text-white hover:bg-[#252540] transition ${pathname === '/' ? 'text-white bg-[#252540]' : 'text-[#a0a0b0]'}`}>
                  <FiHome size={18} /> {t('nav.home')}
                </Link>
                <Link to="/marketplace" onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl hover:text-white hover:bg-[#252540] transition ${pathname === '/marketplace' ? 'text-white bg-[#252540]' : 'text-[#a0a0b0]'}`}>
                  <FiGrid size={18} /> {t('nav.shop')}
                </Link>
                <Link to="/wishlist" onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl hover:text-white hover:bg-[#252540] transition ${pathname === '/wishlist' ? 'text-white bg-[#252540]' : 'text-[#a0a0b0]'}`}>
                  <FiHeart size={18} /> {t('nav.wishlist')}
                </Link>
                <Link to="/faq" onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl hover:text-white hover:bg-[#252540] transition ${pathname === '/faq' ? 'text-white bg-[#252540]' : 'text-[#a0a0b0]'}`}>
                  <FiHelpCircle size={18} /> {t('nav.faq')}
                </Link>
              </nav>

              <div className="p-5 border-t border-[#3a3a5a]">
                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.displayName}
                        className="w-10 h-10 rounded-full border border-[#3a3a5a]"
                      />
                      <span className="text-sm text-white font-medium truncate max-w-[140px]">
                        {user.displayName}
                      </span>
                    </div>
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="p-2 text-[#a0a0b0] hover:text-[#ff6b6b] transition-colors"
                    >
                      <FiLogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <a
                    href={getSteamLoginUrl()}
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#00d9ff] to-[#00ff88] px-4 py-3 rounded-xl text-black font-semibold"
                  >
                    <SiSteam size={18} /> {t('auth.loginSteam')}
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
