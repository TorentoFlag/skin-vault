export const SITE_NAME = 'SkinVault';
export const MAX_PRICE = 50000;
export const MIN_PRICE = 0;
export const PRODUCTS_PER_PAGE = 24;

export const SORT_OPTIONS = [
  'price_asc',
  'price_desc',
  'newest',
  'popular',
  'float_asc',
  'float_desc',
] as const;

export const QUALITY_OPTIONS = ['FN', 'MW', 'FT', 'WW', 'BS'] as const;
export const RARITY_OPTIONS = ['Consumer', 'Industrial', 'Mil-Spec', 'Restricted', 'Classified', 'Covert', 'Contraband'] as const;
export const WEAPON_OPTIONS = ['AK-47', 'M4A4', 'M4A1-S', 'AWP', 'USP-S', 'Glock-18', 'Desert Eagle', 'MP9', 'MAC-10', 'Karambit', 'Butterfly Knife', 'Bayonet', 'M9 Bayonet', 'Scout', 'P90'] as const;
