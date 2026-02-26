import { z } from 'zod';

export const createOrderSchema = z.object({
  itemIds: z
    .array(z.string().cuid('Each item ID must be a valid CUID'))
    .min(1, 'At least 1 item required')
    .max(10, 'Maximum 10 items per order'),
});

export const orderIdParamSchema = z.object({
  id: z.string().cuid('Invalid order ID'),
});
