import type CEconItem from 'steamcommunity/classes/CEconItem';
import { prisma } from '../config/database.ts';
import { steamBot } from './steamBot.ts';
import { env } from '../config/env.ts';
import { logger } from '../utils/logger.ts';
import { AppError } from '../utils/AppError.ts';

function parseTag(item: CEconItem, category: string): string | null {
  // tags is any[] per @types/steamcommunity
  const tag = (item.tags as Array<{ category: string; localized_tag_name: string }>)
    ?.find((t) => t.category === category);
  return tag?.localized_tag_name ?? null;
}

export const syncInventory = async () => {
  const inventory = await steamBot.getInventory();
  logger.info({ count: inventory.length }, 'Syncing bot inventory');

  for (const item of inventory) {
    const iconUrl = item.getImageURL();

    await prisma.item.upsert({
      where: { assetId: String(item.assetid) },
      update: {
        name: item.name ?? '',
        marketHashName: item.market_hash_name ?? '',
        iconUrl,
        rarity: parseTag(item, 'Rarity') ?? 'Unknown',
        exterior: parseTag(item, 'Exterior'),
        type: parseTag(item, 'Type') ?? 'Unknown',
        classId: item.classid != null ? String(item.classid) : null,
        instanceId: item.instanceid != null ? String(item.instanceid) : null,
      },
      create: {
        assetId: String(item.assetid),
        classId: item.classid != null ? String(item.classid) : null,
        instanceId: item.instanceid != null ? String(item.instanceid) : null,
        name: item.name ?? '',
        marketHashName: item.market_hash_name ?? '',
        iconUrl,
        rarity: parseTag(item, 'Rarity') ?? 'Unknown',
        exterior: parseTag(item, 'Exterior'),
        type: parseTag(item, 'Type') ?? 'Unknown',
        price: 0,
        steamPrice: 0,
        botSteamId: env.STEAM_BOT_STEAM_ID,
      },
    });
  }

  logger.info({ count: inventory.length }, 'Inventory sync complete');
};

interface ItemFilters {
  type?: string;
  rarity?: string;
  exterior?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

interface Pagination {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const getAvailableItems = async (filters: ItemFilters, pagination: Pagination) => {
  const where: Record<string, unknown> = { isAvailable: true };

  if (filters.type) where.type = filters.type;
  if (filters.rarity) where.rarity = filters.rarity;
  if (filters.exterior) where.exterior = filters.exterior;
  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      ...(filters.minPrice ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.search) {
    where.name = { contains: filters.search, mode: 'insensitive' };
  }

  const orderBy: Record<string, string> = {};
  const sortField = pagination.sort ?? 'price';
  orderBy[sortField] = pagination.order ?? 'asc';

  const skip = (pagination.page - 1) * pagination.limit;

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy,
      skip,
      take: pagination.limit,
    }),
    prisma.item.count({ where }),
  ]);

  return {
    items,
    total,
    page: pagination.page,
    totalPages: Math.ceil(total / pagination.limit),
  };
};

export const getItemById = async (id: string) => {
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) {
    throw new AppError('Item not found', 404);
  }
  return item;
};

export const lockItems = (itemIds: string[]) =>
  prisma.item.updateMany({
    where: { id: { in: itemIds }, isAvailable: true },
    data: { isAvailable: false },
  });

export const unlockItems = (itemIds: string[]) =>
  prisma.item.updateMany({
    where: { id: { in: itemIds } },
    data: { isAvailable: true },
  });
