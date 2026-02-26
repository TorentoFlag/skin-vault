import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.ts';
import { AppError } from '../utils/AppError.ts';
import { logger } from '../utils/logger.ts';
import { acquireLock, releaseLock } from '../config/redis.ts';
import { unlockItems } from './inventoryService.ts';
import { createCheckoutSession, expireCheckoutSession } from './paymentService.ts';
import type { OrderStatus } from '@prisma/client';

const ACTIVE_STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'TRADE_SENT', 'TRADE_ACCEPTED'];
const LOCK_TTL_MS = 10_000;

export const createOrder = async (userId: string, itemIds: string[]) => {
  const uniqueIds = [...new Set(itemIds)];
  if (uniqueIds.length !== itemIds.length) {
    throw new AppError('Duplicate item IDs are not allowed', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  if (!user.tradeUrl) {
    throw new AppError('Trade URL is required before placing an order', 400);
  }

  const activeOrder = await prisma.order.findFirst({
    where: { userId, status: { in: ACTIVE_STATUSES } },
  });
  if (activeOrder) {
    throw new AppError('You already have an active order. Complete or cancel it first.', 409);
  }

  const items = await prisma.item.findMany({
    where: { id: { in: itemIds }, isAvailable: true },
  });
  if (items.length !== itemIds.length) {
    throw new AppError('One or more items are not available', 409);
  }

  const lockKeys = itemIds.map((id) => `lock:item:${id}`);
  const acquiredLocks: Array<{ key: string; token: string }> = [];

  const releaseAllLocks = async () => {
    for (const { key, token } of acquiredLocks) {
      await releaseLock(key, token);
    }
  };

  try {
    for (const key of lockKeys) {
      const token = await acquireLock(key, LOCK_TTL_MS);
      if (!token) {
        throw new AppError('Items are temporarily locked, please retry', 409);
      }
      acquiredLocks.push({ key, token });
    }

    const recheck = await prisma.item.findMany({
      where: { id: { in: itemIds }, isAvailable: true },
    });
    if (recheck.length !== itemIds.length) {
      throw new AppError('One or more items are no longer available', 409);
    }

    const totalPrice = items.reduce(
      (sum, item) => sum.add(item.price),
      new Prisma.Decimal(0),
    );

    const order = await prisma.$transaction(async (tx) => {
      await tx.item.updateMany({
        where: { id: { in: itemIds }, isAvailable: true },
        data: { isAvailable: false },
      });

      return tx.order.create({
        data: {
          userId,
          totalPrice,
          status: 'PENDING',
          items: {
            create: items.map((item) => ({
              itemId: item.id,
              priceAtPurchase: item.price,
            })),
          },
        },
        include: {
          items: { include: { item: true } },
        },
      });
    });

    let sessionId: string;
    let url: string;
    try {
      const itemNames = items.map((item) => item.name);
      const session = await createCheckoutSession(
        order.id,
        userId,
        Number(totalPrice),
        itemNames,
      );
      sessionId = session.sessionId;
      url = session.url;
    } catch (stripeErr) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      });
      await unlockItems(itemIds);
      logger.error({ orderId: order.id, err: stripeErr }, 'Stripe session creation failed, order rolled back');
      throw stripeErr;
    }

    await prisma.transaction.create({
      data: {
        userId,
        type: 'PAYMENT',
        amount: totalPrice,
        status: 'PENDING',
        stripeSessionId: sessionId,
      },
    });

    logger.info({ orderId: order.id, itemCount: items.length, totalPrice: Number(totalPrice) }, 'Order created');

    return {
      order,
      stripeUrl: url,
    };
  } finally {
    await releaseAllLocks();
  }
};

export const getOrderById = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { item: true } },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }
  if (order.userId !== userId) {
    throw new AppError('Forbidden', 403);
  }

  return order;
};

export const getUserOrders = async (userId: string) =>
  prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { item: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

export const cancelOrder = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }
  if (order.userId !== userId) {
    throw new AppError('Forbidden', 403);
  }
  if (order.status !== 'PENDING') {
    throw new AppError('Only pending orders can be cancelled', 400);
  }

  const itemIds = order.items.map((oi) => oi.itemId);

  const tx = await prisma.transaction.findFirst({
    where: {
      userId,
      type: 'PAYMENT',
      status: 'PENDING',
    },
    orderBy: { createdAt: 'desc' },
  });

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    }),
    ...(tx ? [prisma.transaction.update({
      where: { id: tx.id },
      data: { status: 'FAILED' },
    })] : []),
  ]);

  await unlockItems(itemIds);

  if (tx?.stripeSessionId) {
    await expireCheckoutSession(tx.stripeSessionId);
  }

  logger.info({ orderId }, 'Order cancelled by user');
};
