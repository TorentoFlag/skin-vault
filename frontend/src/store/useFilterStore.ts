import { create } from 'zustand';
import { MAX_PRICE, MIN_PRICE } from '../utils/constants';

interface FilterState {
  priceRange: [number, number];
  qualities: string[];
  weapons: string[];
  rarities: string[];
  sortBy: string;
  searchQuery: string;
  statTrakOnly: boolean;
  inStockOnly: boolean;
  floatRange: [number, number];

  setPriceRange: (range: [number, number]) => void;
  toggleQuality: (quality: string) => void;
  toggleWeapon: (weapon: string) => void;
  setWeapons: (weapons: string[]) => void;
  toggleRarity: (rarity: string) => void;
  setSortBy: (sort: string) => void;
  setSearchQuery: (query: string) => void;
  setStatTrakOnly: (value: boolean) => void;
  setInStockOnly: (value: boolean) => void;
  setFloatRange: (range: [number, number]) => void;
  resetFilters: () => void;
  getActiveCount: () => number;
}

const defaultState = {
  priceRange: [MIN_PRICE, MAX_PRICE] as [number, number],
  qualities: [] as string[],
  weapons: [] as string[],
  rarities: [] as string[],
  sortBy: 'popular',
  searchQuery: '',
  statTrakOnly: false,
  inStockOnly: false,
  floatRange: [0, 1] as [number, number],
};

export const useFilterStore = create<FilterState>()((set, get) => ({
  ...defaultState,

  setPriceRange: (range) => set({ priceRange: range }),

  toggleQuality: (quality) => {
    const qualities = get().qualities;
    set({ qualities: qualities.includes(quality) ? qualities.filter(q => q !== quality) : [...qualities, quality] });
  },

  toggleWeapon: (weapon) => {
    const weapons = get().weapons;
    set({ weapons: weapons.includes(weapon) ? weapons.filter(w => w !== weapon) : [...weapons, weapon] });
  },

  setWeapons: (weapons) => set({ weapons }),

  toggleRarity: (rarity) => {
    const rarities = get().rarities;
    set({ rarities: rarities.includes(rarity) ? rarities.filter(r => r !== rarity) : [...rarities, rarity] });
  },

  setSortBy: (sortBy) => set({ sortBy }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatTrakOnly: (statTrakOnly) => set({ statTrakOnly }),
  setInStockOnly: (inStockOnly) => set({ inStockOnly }),
  setFloatRange: (floatRange) => set({ floatRange }),

  resetFilters: () => set({ ...defaultState }),

  getActiveCount: () => {
    const s = get();
    let count = 0;
    if (s.qualities.length > 0) count++;
    if (s.weapons.length > 0) count++;
    if (s.rarities.length > 0) count++;
    if (s.statTrakOnly) count++;
    if (s.inStockOnly) count++;
    if (s.priceRange[0] > MIN_PRICE || s.priceRange[1] < MAX_PRICE) count++;
    if (s.floatRange[0] > 0 || s.floatRange[1] < 1) count++;
    return count;
  },
}));
