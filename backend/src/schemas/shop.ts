import { z } from 'zod';

// Transform comma-separated string into array of trimmed non-empty values
const csvToArray = z
  .string()
  .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean))
  .pipe(z.array(z.string().min(1)).min(1));

export const catalogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['price', 'name', 'rarity', 'createdAt']).default('price'),
  order: z.enum(['asc', 'desc']).default('asc'),
  type: csvToArray.optional(),
  rarity: csvToArray.optional(),
  exterior: csvToArray.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  search: z.string().max(100).optional(),
});

export const itemIdParamSchema = z.object({
  id: z.string().cuid(),
});
