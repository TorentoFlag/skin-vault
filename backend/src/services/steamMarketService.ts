import { prisma } from '../config/database.ts';
import { logger } from '../utils/logger.ts';
import crypto from 'node:crypto';

const STEAM_MARKET_URL = 'https://steamcommunity.com/market/search/render/';
const STEAM_CDN = 'https://community.fastly.steamstatic.com/economy/image/';
const APP_ID = 730;
const ITEMS_PER_PAGE = 10; // Steam Market caps at 10 results per request
const REQUEST_DELAY_MS = 3500;

// Filter only weapon skins (no cases, stickers, agents, etc.)
const WEAPON_TYPE_TAGS = [
  'tag_CSGO_Type_Pistol',
  'tag_CSGO_Type_SMG',
  'tag_CSGO_Type_Rifle',
  'tag_CSGO_Type_SniperRifle',
  'tag_CSGO_Type_Shotgun',
  'tag_CSGO_Type_Machinegun',
  'tag_CSGO_Type_Knife',
];

interface MarketResult {
  name: string;
  hash_name: string;
  sell_price: number;
  sell_listings: number;
  asset_description: {
    classid: string;
    instanceid: string;
    icon_url: string;
    type: string;
  };
}

interface MarketResponse {
  success: boolean;
  total_count: number;
  results: MarketResult[];
}

function buildSearchUrl(start: number): string {
  const params = new URLSearchParams({
    appid: String(APP_ID),
    norender: '1',
    count: String(ITEMS_PER_PAGE),
    start: String(start),
    sort_column: 'popular',
    sort_dir: 'desc',
  });

  for (const tag of WEAPON_TYPE_TAGS) {
    params.append('category_730_Type[]', tag);
  }

  return `${STEAM_MARKET_URL}?${params.toString()}`;
}

/** Parse "AK-47 | Redline (Field-Tested)" → { weapon, skinName, exterior } */
function parseName(name: string): { weapon: string; skinName: string; exterior: string | null } {
  const exteriorMatch = name.match(/\(([^)]+)\)\s*$/);
  const exterior = exteriorMatch?.[1] ?? null;

  const nameWithoutExterior = exterior
    ? name.slice(0, name.lastIndexOf('(')).trim()
    : name;

  // Remove ★ prefix for knives
  const clean = nameWithoutExterior.replace(/^★\s*/, '').replace(/^StatTrak™\s*/, '');

  const pipeIndex = clean.indexOf(' | ');
  if (pipeIndex === -1) {
    return { weapon: clean, skinName: '', exterior };
  }

  return {
    weapon: clean.slice(0, pipeIndex).trim(),
    skinName: clean.slice(pipeIndex + 3).trim(),
    exterior,
  };
}

/** Map exterior full name → short code */
function exteriorToCode(exterior: string | null): string | null {
  if (!exterior) return null;
  const map: Record<string, string> = {
    'Factory New': 'FN',
    'Minimal Wear': 'MW',
    'Field-Tested': 'FT',
    'Well-Worn': 'WW',
    'Battle-Scarred': 'BS',
  };
  return map[exterior] ?? exterior;
}

/** Parse rarity from asset_description.type, e.g. "Mil-Spec Grade Rifle" → "Mil-Spec" */
function parseRarity(type: string): string {
  const rarityMap: Record<string, string> = {
    'consumer grade': 'Consumer',
    'industrial grade': 'Industrial',
    'mil-spec grade': 'Mil-Spec',
    'restricted': 'Restricted',
    'classified': 'Classified',
    'covert': 'Covert',
    'contraband': 'Contraband',
    'extraordinary': 'Covert',
  };

  const lower = type.toLowerCase();
  for (const [key, value] of Object.entries(rarityMap)) {
    if (lower.includes(key)) return value;
  }
  return 'Unknown';
}

/** Parse weapon type from asset_description.type, e.g. "Mil-Spec Grade Rifle" → "Rifle" */
function parseType(type: string): string {
  const typeMap: Record<string, string> = {
    pistol: 'Pistol',
    smg: 'SMG',
    rifle: 'Rifle',
    'sniper rifle': 'Sniper Rifle',
    shotgun: 'Shotgun',
    machinegun: 'Machinegun',
    knife: 'Knife',
  };

  const lower = type.toLowerCase();
  for (const [key, value] of Object.entries(typeMap)) {
    if (lower.includes(key)) return value;
  }
  return 'Other';
}

function generateAssetId(hashName: string): string {
  return crypto.createHash('sha256').update(hashName).digest('hex').slice(0, 24);
}

async function fetchPage(start: number): Promise<MarketResponse> {
  const url = buildSearchUrl(start);
  logger.debug({ url, start }, 'Fetching Steam Market page');

  const res = await fetch(url, {
    headers: {
      'Accept-Language': 'en',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });

  if (!res.ok) {
    throw new Error(`Steam Market responded with ${res.status}`);
  }

  return res.json() as Promise<MarketResponse>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const syncFromMarket = async (totalItems = 200) => {
  logger.info({ totalItems }, 'Starting Steam Market sync');

  const pages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  let synced = 0;

  for (let page = 0; page < pages; page++) {
    const start = page * ITEMS_PER_PAGE;

    try {
      const data = await fetchPage(start);

      if (!data.success || !data.results?.length) {
        logger.warn({ start }, 'Empty or failed Steam Market response');
        break;
      }

      for (const result of data.results) {
        const { weapon, skinName, exterior } = parseName(result.name);
        const rarity = parseRarity(result.asset_description.type);
        const type = parseType(result.asset_description.type);
        const priceUsd = result.sell_price / 100;
        const assetId = generateAssetId(result.hash_name);
        const iconUrl = `${STEAM_CDN}${result.asset_description.icon_url}`;

        await prisma.item.upsert({
          where: { assetId },
          update: {
            name: skinName || result.name,
            marketHashName: result.hash_name,
            iconUrl,
            rarity,
            exterior: exteriorToCode(exterior),
            type,
            price: priceUsd,
            steamPrice: priceUsd,
            classId: result.asset_description.classid,
            instanceId: result.asset_description.instanceid,
          },
          create: {
            assetId,
            classId: result.asset_description.classid,
            instanceId: result.asset_description.instanceid,
            name: skinName || result.name,
            marketHashName: result.hash_name,
            iconUrl,
            rarity,
            exterior: exteriorToCode(exterior),
            type,
            price: priceUsd,
            steamPrice: priceUsd,
            botSteamId: 'market',
            isAvailable: true,
          },
        });

        synced++;
      }

      logger.info({ page: page + 1, pages, synced }, 'Market sync page complete');

      // Delay between pages to respect rate limits
      if (page < pages - 1) {
        await sleep(REQUEST_DELAY_MS);
      }
    } catch (err) {
      logger.error({ err, start }, 'Failed to fetch Steam Market page');
      break;
    }
  }

  logger.info({ synced }, 'Steam Market sync complete');
  return synced;
};
