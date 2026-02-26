import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiX } from 'react-icons/fi';
import { useFilterStore } from '../../../store/useFilterStore';
import { getRarityColor, getQualityColor } from '../../../utils/getRarityColor';
import { useFormatPrice } from '../../../utils/formatPrice';
import { QUALITY_OPTIONS, RARITY_OPTIONS, WEAPON_OPTIONS, MAX_PRICE } from '../../../utils/constants';
import { useTranslation } from 'react-i18next';

function AccordionSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#2a2a3a]">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3.5 text-left"
      >
        <span className="font-medium text-white text-sm">{title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FiChevronDown size={16} className="text-[#6b6b7b]" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FilterSidebar() {
  const { t } = useTranslation();
  const { formatPrice } = useFormatPrice();
  const {
    priceRange, setPriceRange,
    qualities, toggleQuality,
    weapons, toggleWeapon,
    rarities, toggleRarity,
    statTrakOnly, setStatTrakOnly,
    inStockOnly, setInStockOnly,
    resetFilters, getActiveCount,
  } = useFilterStore();

  const activeCount = getActiveCount();

  return (
    <aside className="w-[280px] flex-shrink-0 bg-[#1a1a2e] border border-[#3a3a5a] rounded-2xl p-5 h-fit sticky top-[90px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-white font-exo2 text-lg">{t('filter.title')}</h3>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-[#00d9ff]/20 text-[#00d9ff] text-xs rounded-full border border-[#00d9ff]/30 font-medium">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-[#ff6b6b] hover:text-white transition">
            <FiX size={12} /> {t('filter.reset')}
          </button>
        )}
      </div>

      {/* Price Range */}
      <AccordionSection title={t('filter.priceRange')} defaultOpen>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-[#a0a0b0]">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
          <div className="dual-range-slider">
            <div className="dual-range-track" />
            <div
              className="dual-range-fill"
              style={{
                left: `${(priceRange[0] / MAX_PRICE) * 100}%`,
                right: `${100 - (priceRange[1] / MAX_PRICE) * 100}%`,
              }}
            />
            <input
              type="range"
              min={0}
              max={MAX_PRICE}
              value={priceRange[0]}
              onChange={e => {
                const v = +e.target.value;
                setPriceRange([Math.min(v, priceRange[1]), priceRange[1]]);
              }}
            />
            <input
              type="range"
              min={0}
              max={MAX_PRICE}
              value={priceRange[1]}
              onChange={e => {
                const v = +e.target.value;
                setPriceRange([priceRange[0], Math.max(v, priceRange[0])]);
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[{ label: `< ${formatPrice(50)}`, range: [0, 50] }, { label: `${formatPrice(50)}–${formatPrice(500)}`, range: [50, 500] }, { label: `${formatPrice(500)}–${formatPrice(2000)}`, range: [500, 2000] }, { label: `> ${formatPrice(2000)}`, range: [2000, MAX_PRICE] }].map(({ label, range }) => {
              const isActive = priceRange[0] === range[0] && priceRange[1] === range[1];
              return (
                <button
                  key={label}
                  onClick={() => setPriceRange(range as [number, number])}
                  className={`text-xs px-2 py-1.5 rounded-lg border transition ${isActive ? 'border-[#00d9ff] text-[#00d9ff] bg-[#00d9ff]/10' : 'border-[#3a3a5a] text-[#a0a0b0] hover:border-[#00d9ff] hover:text-[#00d9ff]'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </AccordionSection>

      {/* Quality */}
      <AccordionSection title={t('filter.quality')} defaultOpen>
        <div className="flex flex-col gap-1.5">
          {QUALITY_OPTIONS.map(q => (
            <label key={q} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${qualities.includes(q) ? 'border-0' : 'border-[#3a3a5a]'}`}
                style={qualities.includes(q) ? { backgroundColor: getQualityColor(q as any) } : {}}
              >
                {qualities.includes(q) && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <input type="checkbox" checked={qualities.includes(q)} onChange={() => toggleQuality(q)} className="hidden" />
              <span className="text-sm" style={{ color: getQualityColor(q as any) }}>{q}</span>
              <span className="text-xs text-[#6b6b7b] group-hover:text-[#a0a0b0] transition">
                {t(`filter.qualityLabels.${q}`)}
              </span>
            </label>
          ))}
        </div>
      </AccordionSection>

      {/* Rarity */}
      <AccordionSection title={t('filter.rarity')}>
        <div className="flex flex-col gap-1.5">
          {RARITY_OPTIONS.map(r => (
            <label key={r} className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${rarities.includes(r) ? 'border-0' : 'border-[#3a3a5a]'}`}
                style={rarities.includes(r) ? { backgroundColor: getRarityColor(r as any) } : {}}
              >
                {rarities.includes(r) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <input type="checkbox" checked={rarities.includes(r)} onChange={() => toggleRarity(r)} className="hidden" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getRarityColor(r as any) }} />
                <span className="text-sm text-[#a0a0b0]">{r}</span>
              </div>
            </label>
          ))}
        </div>
      </AccordionSection>

      {/* Weapons */}
      <AccordionSection title={t('filter.weapons')}>
        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
          {WEAPON_OPTIONS.map(w => (
            <label key={w} className="flex items-center gap-3 cursor-pointer py-0.5">
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${weapons.includes(w) ? 'bg-[#00d9ff] border-[#00d9ff]' : 'border-[#3a3a5a]'}`}
              >
                {weapons.includes(w) && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <input type="checkbox" checked={weapons.includes(w)} onChange={() => toggleWeapon(w)} className="hidden" />
              <span className="text-sm text-[#a0a0b0]">{w}</span>
            </label>
          ))}
        </div>
      </AccordionSection>

      {/* Toggles */}
      <AccordionSection title={t('filter.other')}>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-[#a0a0b0]">{t('filter.statTrakOnly')}</span>
            <div
              onClick={() => setStatTrakOnly(!statTrakOnly)}
              className={`w-11 h-6 rounded-full transition-all duration-200 relative cursor-pointer flex-shrink-0 ${statTrakOnly ? 'bg-[#e4ae39]' : 'bg-[#3a3a5a]'}`}
            >
              <div className={`absolute top-1/2 -translate-y-1/2 left-[4px] w-4 h-4 bg-white rounded-full transition-all duration-200 ${statTrakOnly ? 'translate-x-[20px]' : 'translate-x-0'}`} />
            </div>
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-[#a0a0b0]">{t('filter.inStockOnly')}</span>
            <div
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`w-11 h-6 rounded-full transition-all duration-200 relative cursor-pointer flex-shrink-0 ${inStockOnly ? 'bg-[#00ff88]' : 'bg-[#3a3a5a]'}`}
            >
              <div className={`absolute top-1/2 -translate-y-1/2 left-[4px] w-4 h-4 bg-white rounded-full transition-all duration-200 ${inStockOnly ? 'translate-x-[20px]' : 'translate-x-0'}`} />
            </div>
          </label>
        </div>
      </AccordionSection>
    </aside>
  );
}
