import type { Request, Response } from 'express';
import { constructWebhookEvent, handleWebhookEvent } from '../services/paymentService.ts';
import { AppError } from '../utils/AppError.ts';
import { logger } from '../utils/logger.ts';

export const stripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string | undefined;
  if (!signature) {
    throw new AppError('Missing Stripe signature', 400);
  }

  if (!Buffer.isBuffer(req.body)) {
    throw new AppError('Webhook body must be raw Buffer', 400);
  }

  let event;
  try {
    event = constructWebhookEvent(req.body, signature);
  } catch (err) {
    logger.warn({ err }, 'Invalid Stripe webhook signature');
    throw new AppError('Invalid webhook signature', 400);
  }

  await handleWebhookEvent(event);
  res.json({ received: true });
};
