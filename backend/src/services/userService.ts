import { prisma } from '../config/database.ts';
import { AppError } from '../utils/AppError.ts';

export const findById = (id: string) =>
  prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      steamId: true,
      displayName: true,
      avatar: true,
      tradeUrl: true,
      balance: true,
      createdAt: true,
    },
  });

export const findBySteamId = (steamId: string) =>
  prisma.user.findUnique({ where: { steamId } });

export const updateTradeUrl = async (userId: string, tradeUrl: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { tradeUrl },
    select: {
      id: true,
      tradeUrl: true,
    },
  });
};

export const getBalance = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true },
  });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user.balance;
};
