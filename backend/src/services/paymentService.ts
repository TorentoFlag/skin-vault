import Stripe from 'stripe';
import { env } from '../config/env.ts';
import { prisma } from '../config/database.ts';
import { AppError } from '../utils/AppError.ts';
import { logger } from '../utils/logger.ts';
import { tradeQueue } from '../config/queues.ts';
import { unlockItems } from './inventoryService.ts';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (
  orderId: string,
  userId: string,
  totalPrice: number,
  itemNames: string[],
): Promise<{ sessionId: string; url: string }> => {
  const amountKopecks = Math.round(totalPrice * 100);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: 'rub',
    line_items: [
      {
        price_data: {
          currency: 'rub',
          unit_amount: amountKopecks,
          product_data: {
            name: `CS2 Skins (${itemNames.length} items)`,
            description: itemNames.slice(0, 5).join(', ') + (itemNames.length > 5 ? '...' : ''),
          },
        },
        quantity: 1,
      },
    ],
    metadata: { orderId, userId },
    success_url: `${env.ALLOWED_ORIGINS.split(',')[0].trim()}/orders/${orderId}?status=success`,
    cancel_url: `${env.ALLOWED_ORIGINS.split(',')[0].trim()}/orders/${orderId}?status=cancelled`,
    expires_at: Math.floor(Date.now() / 1000) + 1800,
  });

  if (!session.url) {
    throw new AppError('Failed to create Stripe checkout session', 500);
  }

  return { sessionId: session.id, url: session.url };
};

export const constructWebhookEvent = (payload: Buffer, signature: string): Stripe.Event =>
  stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);

export const handleWebhookEvent = async (event: Stripe.Event): Promise<void> => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (!orderId) {
        logger.warn({ sessionId: session.id }, 'Webhook: missing orderId in metadata');
        return;
      }
      await markOrderPaid(orderId, session.id, session.payment_intent as string);
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (!orderId) return;
      await markOrderExpired(orderId, session.id);
      break;
    }

    default:
      logger.debug({ type: event.type }, 'Webhook: unhandled event type');
  }
};

const markOrderPaid = async (orderId: string, stripeSessionId: string, paymentIntentId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { item: true } }, user: true },
  });

  if (!order) {
    logger.warn({ orderId }, 'Webhook: order not found');
    return;
  }

  if (order.status !== 'PENDING') {
    logger.warn({ orderId, status: order.status }, 'Webhook: order not in PENDING status');
    return;
  }

  if (!order.user.tradeUrl) {
    logger.error({ orderId, userId: order.userId }, 'User has no trade URL at payment time');
    await prisma.order.update({ where: { id: orderId }, data: { status: 'FAILED' } });
    const itemIds = order.items.map((oi) => oi.itemId);
    await unlockItems(itemIds);
    await issueRefund(orderId);
    return;
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID', paidAt: new Date() },
    }),
    prisma.transaction.updateMany({
      where: { stripeSessionId, userId: order.userId, status: 'PENDING' },
      data: { status: 'COMPLETED' },
    }),
  ]);

  const itemAssetIds = order.items.map((oi) => oi.item.assetId);
  const itemIds = order.items.map((oi) => oi.itemId);

  await tradeQueue.add('send-trade', {
    orderId,
    userId: order.userId,
    tradeUrl: order.user.tradeUrl,
    itemAssetIds,
    itemIds,
  });

  logger.info({ orderId, stripeSessionId, paymentIntentId }, 'Order marked as PAID, trade job enqueued');
};

const markOrderExpired = async (orderId: string, stripeSessionId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.status !== 'PENDING') return;

  const itemIds = order.items.map((oi) => oi.itemId);

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    }),
    prisma.transaction.updateMany({
      where: { stripeSessionId, userId: order.userId, status: 'PENDING' },
      data: { status: 'FAILED' },
    }),
  ]);

  await unlockItems(itemIds);
  logger.info({ orderId }, 'Order expired (Stripe session), items unlocked');
};

export const issueRefund = async (orderId: string): Promise<void> => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    logger.warn({ orderId }, 'Refund: order not found');
    return;
  }

  const transaction = await prisma.transaction.findFirst({
    where: {
      userId: order.userId,
      type: 'PAYMENT',
      status: 'COMPLETED',
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!transaction?.stripeSessionId) {
    logger.warn({ orderId }, 'Refund: no completed payment transaction found');
    return;
  }

  const session = await stripe.checkout.sessions.retrieve(transaction.stripeSessionId);
  if (!session.payment_intent) {
    logger.warn({ orderId }, 'Refund: no payment intent found');
    return;
  }

  await stripe.refunds.create({
    payment_intent: session.payment_intent as string,
  });

  await prisma.transaction.create({
    data: {
      userId: order.userId,
      type: 'REFUND',
      amount: transaction.amount,
      status: 'COMPLETED',
      stripeSessionId: transaction.stripeSessionId,
    },
  });

  logger.info({ orderId, stripeSessionId: transaction.stripeSessionId }, 'Refund issued');
};

export const expireCheckoutSession = async (stripeSessionId: string): Promise<void> => {
  try {
    await stripe.checkout.sessions.expire(stripeSessionId);
  } catch (err) {
    logger.warn({ stripeSessionId, err }, 'Failed to expire Stripe session (may already be expired)');
  }
};
