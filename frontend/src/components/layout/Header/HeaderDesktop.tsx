import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiLogOut } from 'react-icons/fi';
import { SiSteam } from 'react-icons/si';
import { useCartStore } from '../../../store/useCartStore';
import { useWishlistStore } from '../../../store/useWishlistStore';
import { useFilterStore } from '../../../store/useFilterStore';
import { useState, useRef, useEffect, useMemo } from 'react';
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

export function HeaderDesktop() {
  const { t } = useTranslation();
  const { formatPrice } = useFormatPrice();
  const cartCount = useCartStore(s => s.getCount());
  const wishlistCount = useWishlistStore(s => s.getCount());
  const toggleCart = useCartStore(s => s.toggleCart);
  const setSearchQuery = useFilterStore(s => s.setSearchQuery);
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuthStore();
  const { products } = useProducts();
  const [inputVal, setInputVal] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
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
      .slice(0, 6);
  }, [inputVal]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setSearchQuery(inputVal);
    setOpen(false);
    navigate('/marketplace');
  }

  function handleSuggestionClick(product: Product) {
    setInputVal('');
    setOpen(false);
    navigate(`/product/${product.id}`);
  }


  return (
    <header className="fixed top-0 left-0 right-0 h-[70px] bg-[#0f0f1a]/80 backdrop-blur-md z-50 border-b border-[#3a3a5a]">
      <div className="max-w-[1600px] mx-auto px-8 h-full flex items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <span className="text-2xl font-bold font-exo2 bg-gradient-to-r from-[#00d9ff] to-[#00ff88] bg-clip-text text-transparent">
            SkinVault
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden laptop:flex items-center gap-8 text-[#a0a0b0]">
          <Link to="/marketplace" className={`hover:text-[#00d9ff] transition-colors duration-200 text-sm font-medium relative group ${pathname === '/marketplace' ? 'text-[#00d9ff]' : ''}`}>
            {t('nav.market')}
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#00d9ff] transition-all duration-200 ${pathname === '/marketplace' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
          </Link>
          <Link to="/faq" className={`hover:text-[#00d9ff] transition-colors duration-200 text-sm font-medium relative group ${pathname === '/faq' ? 'text-[#00d9ff]' : ''}`}>
            {t('nav.faq')}
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#00d9ff] transition-all duration-200 ${pathname === '/faq' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
          </Link>
        </nav>

        {/* Search (invisible on marketplace — it has its own, but keeps space) */}
        <div ref={wrapperRef} className={`hidden laptop:flex flex-1 max-w-[400px] relative ${pathname === '/marketplace' ? 'invisible pointer-events-none' : ''}`}>
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b7b]" size={16} />
              <input
                value={inputVal}
                onChange={e => { setInputVal(e.target.value); setOpen(true); }}
                onFocus={() => inputVal.trim().length >= 2 && setOpen(true)}
                onKeyDown={e => e.key === 'Escape' && setOpen(false)}
                className="w-full bg-[#1a1a2e] border border-[#3a3a5a] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-[#6b6b7b] focus:border-[#00d9ff] focus:shadow-[0_0_15px_rgba(0,217,255,0.3)] outline-none transition-all duration-200"
                placeholder={t('search.placeholder')}
              />
            </div>
          </form>

          {/* Dropdown */}
          {open && inputVal.trim().length >= 2 && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[#1a1a2e] border border-[#3a3a5a] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden z-50">
              {suggestions.length > 0 ? suggestions.map(product => (
                <button
                  key={product.id}
                  onMouseDown={() => handleSuggestionClick(product)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#252540] transition-colors text-left"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 rounded-md object-cover bg-[#252540] flex-shrink-0"
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
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Language & Currency Switchers */}
          <LanguageSwitcher />
          <CurrencySwitcher />

          {/* Wishlist */}
          <Link to="/wishlist" className="relative p-2 text-[#a0a0b0] hover:text-[#ff6b6b] transition-colors">
            <FiHeart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff6b6b] text-white text-xs rounded-full flex items-center justify-center font-bold">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <button onClick={toggleCart} className="relative p-2 text-[#a0a0b0] hover:text-[#00d9ff] transition-colors">
            <FiShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00d9ff] text-black text-xs rounded-full flex items-center justify-center font-bold">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          {/* Auth */}
          {authLoading ? (
            <div className="hidden laptop:flex items-center gap-2 px-4 py-2">
              <div className="w-5 h-5 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isAuthenticated && user ? (
            <div className="hidden laptop:flex items-center gap-1.5 ml-3">
              <div className="flex items-center gap-2">
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-[39px] h-[39px] rounded-full border border-[#3a3a5a]"
                />
                <span className="text-sm text-white font-medium max-w-[120px] truncate">
                  {user.displayName}
                </span>
              </div>
              <button
                onClick={() => logout()}
                className="p-2 text-[#a0a0b0] hover:text-[#ff6b6b] transition-colors"
                title={t('auth.logout')}
              >
                <FiLogOut size={18} />
              </button>
            </div>
          ) : (
            <a
              href={getSteamLoginUrl()}
              className="hidden laptop:flex items-center gap-2 bg-gradient-to-r from-[#00d9ff] to-[#00ff88] px-4 py-2 rounded-lg text-black font-semibold text-sm hover:shadow-[0_0_20px_rgba(0,217,255,0.5)] transition-all duration-200 hover:opacity-90"
            >
              <SiSteam size={16} />
              {t('auth.loginSteam')}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
