export type Quality = 'FN' | 'MW' | 'FT' | 'WW' | 'BS';
export type Rarity = 'Consumer' | 'Industrial' | 'Mil-Spec' | 'Restricted' | 'Classified' | 'Covert' | 'Contraband';
export type Weapon = 'AK-47' | 'M4A4' | 'M4A1-S' | 'AWP' | 'USP-S' | 'Glock-18' | 'Desert Eagle' | 'MP9' | 'MAC-10' | 'SG 553' | 'FAMAS' | 'Galil AR' | 'Scout' | 'P90' | 'Nova' | 'XM1014' | 'Karambit' | 'Butterfly Knife' | 'Bayonet' | 'Flip Knife' | 'M9 Bayonet';

export interface Sticker {
  id: string;
  name: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  weapon: Weapon;
  quality: Quality;
  float: number;
  price: number;
  originalPrice?: number;
  image: string;
  statTrak: boolean;
  rarity: Rarity;
  inStock: boolean;
  discount?: number;
  collection?: string;
  stickers?: Sticker[];
  priceHistory?: { date: string; price: number }[];
  views?: number;
  createdAt?: string;
  isNew?: boolean;
  isPopular?: boolean;
}
