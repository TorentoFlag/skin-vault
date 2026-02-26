import { z } from 'zod';

export const catalogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['price', 'name', 'rarity', 'createdAt']).default('price'),
  order: z.enum(['asc', 'desc']).default('asc'),
  type: z.string().optional(),
  rarity: z.string().optional(),
  exterior: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  search: z.string().max(100).optional(),
});

export const itemIdParamSchema = z.object({
  id: z.string().cuid(),
});
