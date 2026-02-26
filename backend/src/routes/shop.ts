import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { validate } from '../middleware/validate.ts';
import { catalogQuerySchema, itemIdParamSchema } from '../schemas/shop.ts';
import { getCatalog, getItem } from '../controllers/shopController.ts';

const router = Router();

// GET /api/shop — catalog with filters & pagination
router.get('/', validate(catalogQuerySchema, 'query'), asyncHandler(getCatalog));

// GET /api/shop/:id — single item
router.get('/:id', validate(itemIdParamSchema, 'params'), asyncHandler(getItem));

export default router;
