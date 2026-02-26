import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSliders, FiX, FiChevronDown } from 'react-icons/fi';
import { FilterSidebar } from '../../components/layout/Sidebar/FilterSidebar';
import { ProductGrid } from '../../components/product/ProductGrid/ProductGrid';
import { Input } from '../../components/common/Input/Input';
import { useFilterStore } from '../../store/useFilterStore';
import { useProducts } from '../../hooks/useProducts';
import { FetchError } from '../../components/common/FetchError/FetchError';
import { useDebounce } from '../../hooks/useDebounce';
import { SORT_OPTIONS, PRODUCTS_PER_PAGE } from '../../utils/constants';
import { FiSearch } from 'react-icons/fi';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function Marketplace() {
  const { t } = useTranslation('marketplace');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const {
    priceRange, qualities, weapons, rarities, sortBy, searchQuery,
    statTrakOnly, inStockOnly, floatRange,
    setSortBy, setSearchQuery, getActiveCount,
  } = useFilterStore();
  const { products: allProducts, error, retry } = useProducts();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);
  const activeCount = getActiveCount();

  useEffect(() => {
    setSearchQuery(debouncedSearch);
    setPage(1);
  }, [debouncedSearch, setSearchQuery]);

  const filtered = useMemo(() => {
    let result = [...allProducts];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.weapon.toLowerCase().includes(q) ||
        p.collection?.toLowerCase().includes(q)
      );
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (qualities.length > 0) result = result.filter(p => qualities.includes(p.quality));
    if (weapons.length > 0) result = result.filter(p => weapons.includes(p.weapon));
    if (rarities.length > 0) result = result.filter(p => rarities.includes(p.rarity));
    if (statTrakOnly) result = result.filter(p => p.statTrak);
    if (inStockOnly) result = result.filter(p => p.inStock);
    result = result.filter(p => p.float >= floatRange[0] && p.float <= floatRange[1]);

    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'newest': result.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()); break;
      case 'popular': result.sort((a, b) => (b.views || 0) - (a.views || 0)); break;
      case 'float_asc': result.sort((a, b) => a.float - b.float); break;
      case 'float_desc': result.sort((a, b) => b.float - a.float); break;
    }

    return result;
  }, [allProducts, priceRange, qualities, weapons, rarities, sortBy, debouncedSearch, statTrakOnly, inStockOnly, floatRange]);

  const paginated = filtered.slice(0, page * PRODUCTS_PER_PAGE);
  const hasMore = paginated.length < filtered.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-page pb-10"
    >
      <div className="max-w-[1600px] mx-auto px-4 laptop:px-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-exo2 text-white">{t('title')}</h1>
          <p className="text-[#6b6b7b] mt-1">{t('skinsAvailable', { count: filtered.length })}</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-[#1a1a2e] rounded-xl border border-[#3a3a5a]">
          {/* Search */}
          <div className="flex-1" style={{ minWidth: 250 }}>
            <Input
              icon={<FiSearch size={14} />}
              value={localSearch}
              onChange={e => { setLocalSearch(e.target.value); setPage(1); }}
              placeholder={t('common:search.placeholderExtended')}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(1); }}
              className="appearance-none bg-[#252540] border border-[#3a3a5a] rounded-lg px-4 py-2.5 pr-8 text-sm text-white focus:border-[#00d9ff] outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{t(`common:sort.${opt}`)}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b6b7b] pointer-events-none" size={14} />
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="laptop:hidden flex items-center gap-2 px-4 py-2.5 bg-[#252540] border border-[#3a3a5a] rounded-lg text-[#a0a0b0] hover:text-white hover:border-[#00d9ff] transition text-sm"
          >
            <FiSliders size={14} />
            {t('filters')}
            {activeCount > 0 && (
              <span className="px-1.5 py-0.5 bg-[#00d9ff] text-black text-xs rounded-full font-bold">{activeCount}</span>
            )}
          </button>

          {/* Results count */}
          <span className="text-sm text-[#6b6b7b] ml-auto hidden tablet:block">
            {t('shown', { shown: Math.min(paginated.length, filtered.length), total: filtered.length })}
          </span>
        </div>

        {/* Layout */}
        <div className="flex gap-6">
          {/* Sidebar Desktop */}
          <div className="hidden laptop:block">
            <FilterSidebar />
          </div>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {error && allProducts.length === 0 ? (
              <FetchError onRetry={retry} />
            ) : (
              <>
                <ProductGrid products={paginated} />
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => setPage(p => p + 1)}
                      className="px-8 py-3 bg-[#252540] border border-[#3a3a5a] rounded-xl text-[#a0a0b0] hover:text-white hover:border-[#00d9ff] transition font-medium"
                    >
                      {t('common:actions.loadMore', { count: filtered.length - paginated.length })}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 bg-[#1a1a2e] rounded-t-2xl z-50 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-[#3a3a5a] sticky top-0 bg-[#1a1a2e] z-10">
                <h3 className="font-bold text-white font-exo2 text-xl">{t('common:filter.title')}</h3>
                <button onClick={() => setSidebarOpen(false)} className="text-[#6b6b7b] hover:text-white">
                  <FiX size={20} />
                </button>
              </div>
              <div className="p-5">
                <FilterSidebar />
              </div>
              <div className="p-5 border-t border-[#3a3a5a]">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-full py-3 bg-gradient-to-r from-[#00d9ff] to-[#00ff88] rounded-xl text-black font-semibold"
                >
                  {t('common:actions.showResults', { count: filtered.length })}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
