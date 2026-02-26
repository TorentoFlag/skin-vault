import { Router } from 'express';
import { z } from 'zod';
import { auth } from '../middleware/auth.ts';
import { validate } from '../middleware/validate.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';
import * as userController from '../controllers/userController.ts';

const router = Router();

const tradeUrlSchema = z.object({
  tradeUrl: z
    .string()
    .regex(
      /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=\w+$/,
      'Invalid Steam trade URL format',
    ),
});

router.get('/profile', auth, asyncHandler(userController.getProfile));
router.patch('/trade-url', auth, validate(tradeUrlSchema), asyncHandler(userController.updateTradeUrl));
router.get('/balance', auth, asyncHandler(userController.getBalance));

export default router;
