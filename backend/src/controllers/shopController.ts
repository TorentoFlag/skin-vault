import type { Request, Response } from 'express';
import { getAvailableItems, getItemById } from '../services/inventoryService.ts';

export const getCatalog = async (req: Request, res: Response) => {
  const query = req.query as Record<string, unknown>;

  const result = await getAvailableItems(
    {
      type: query.type as string | undefined,
      rarity: query.rarity as string | undefined,
      exterior: query.exterior as string | undefined,
      minPrice: query.minPrice as number | undefined,
      maxPrice: query.maxPrice as number | undefined,
      search: query.search as string | undefined,
    },
    {
      page: query.page as number,
      limit: query.limit as number,
      sort: query.sort as string,
      order: query.order as 'asc' | 'desc',
    },
  );

  res.json(result);
};

export const getItem = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await getItemById(id);
  res.json(item);
};
