import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { stripeWebhook } from '../controllers/paymentController.ts';

const router = Router();

router.post('/webhook', asyncHandler(stripeWebhook));

export default router;
