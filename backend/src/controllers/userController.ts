import type { Request, Response } from 'express';
import * as userService from '../services/userService.ts';
import { AppError } from '../utils/AppError.ts';

export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user!.userId!;
  const user = await userService.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  res.json(user);
};

export const updateTradeUrl = async (req: Request, res: Response) => {
  const userId = req.user!.userId!;
  const { tradeUrl } = req.body as { tradeUrl: string };
  const updated = await userService.updateTradeUrl(userId, tradeUrl);
  res.json(updated);
};

export const getBalance = async (req: Request, res: Response) => {
  const userId = req.user!.userId!;
  const balance = await userService.getBalance(userId);
  res.json({ balance });
};
