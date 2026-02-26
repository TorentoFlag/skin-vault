import { apiFetch } from './client';
import type { Product, Quality, Rarity, Weapon } from '../@types';

interface ApiItem {
  id: string;
  assetId: string;
  name: string;
  marketHashName: string;
  iconUrl: string;
  rarity: string;
  exterior: string | null;
  type: string;
  price: string;
  steamPrice: string;
  isAvailable: boolean;
  createdAt: string;
}

interface CatalogResponse {
  items: ApiItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FetchItemsParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  type?: string;
  rarity?: string;
  exterior?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

const VALID_WEAPONS: Set<string> = new Set([
  'AK-47', 'M4A4', 'M4A1-S', 'AWP', 'USP-S', 'Glock-18', 'Desert Eagle',
  'MP9', 'MAC-10', 'SG 553', 'FAMAS', 'Galil AR', 'Scout', 'P90',
  'Nova', 'XM1014', 'Karambit', 'Butterfly Knife', 'Bayonet', 'Flip Knife', 'M9 Bayonet',
]);

const VALID_QUALITIES: Set<string> = new Set(['FN', 'MW', 'FT', 'WW', 'BS']);

const VALID_RARITIES: Set<string> = new Set([
  'Consumer', 'Industrial', 'Mil-Spec', 'Restricted', 'Classified', 'Covert', 'Contraband',
]);

function parseWeapon(marketHashName: string): Weapon {
  const clean = marketHashName.replace(/^★\s*/, '').replace(/^StatTrak™\s*/, '');
  const pipeIndex = clean.indexOf(' | ');
  const weaponStr = pipeIndex !== -1 ? clean.slice(0, pipeIndex).trim() : clean;
  return (VALID_WEAPONS.has(weaponStr) ? weaponStr : 'AK-47') as Weapon;
}

function mapItem(item: ApiItem): Product {
  const quality = (VALID_QUALITIES.has(item.exterior ?? '') ? item.exterior : 'FT') as Quality;
  const rarity = (VALID_RARITIES.has(item.rarity) ? item.rarity : 'Mil-Spec') as Rarity;
  const price = parseFloat(item.price);
  const isStatTrak = item.marketHashName.includes('StatTrak™');

  return {
    id: item.id,
    name: item.name,
    weapon: parseWeapon(item.marketHashName),
    quality,
    float: 0,
    price,
    image: item.iconUrl,
    statTrak: isStatTrak,
    rarity,
    inStock: item.isAvailable,
    createdAt: item.createdAt,
  };
}

export async function fetchItems(params: FetchItemsParams = {}): Promise<{
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const query = new URLSearchParams();

  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.sort) query.set('sort', params.sort);
  if (params.order) query.set('order', params.order);
  if (params.type) query.set('type', params.type);
  if (params.rarity) query.set('rarity', params.rarity);
  if (params.exterior) query.set('exterior', params.exterior);
  if (params.minPrice) query.set('minPrice', String(params.minPrice));
  if (params.maxPrice) query.set('maxPrice', String(params.maxPrice));
  if (params.search) query.set('search', params.search);

  const qs = query.toString();
  const url = `/api/shop${qs ? `?${qs}` : ''}`;

  const data = await apiFetch<CatalogResponse>(url);

  return {
    items: data.items.map(mapItem),
    total: data.total,
    page: data.page,
    totalPages: data.totalPages,
  };
}

export async function fetchItemById(id: string): Promise<Product> {
  const item = await apiFetch<ApiItem>(`/api/shop/${id}`);
  return mapItem(item);
}
