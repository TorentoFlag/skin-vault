import type { Request, Response } from 'express';
import * as orderService from '../services/orderService.ts';

export const createOrder = async (req: Request, res: Response) => {
  const userId = req.user!.userId!;
  const { itemIds } = req.body as { itemIds: string[] };
  const result = await orderService.createOrder(userId, itemIds);
  res.status(201).json(result);
};

export const getOrder = async (req: Request, res: Response) => {
  const userId = req.user!.userId!;
  const { id } = req.params as { id: string };
  const order = await orderService.getOrderById(id, userId);
  res.json(order);
};

export const listOrders = async (req: Request, res: Response) => {
  const userId = req.user!.userId!;
  const orders = await orderService.getUserOrders(userId);
  res.json(orders);
};

export const cancelOrder = async (req: Request, res: Response) => {
  const userId = req.user!.userId!;
  const { id } = req.params as { id: string };
  await orderService.cancelOrder(id, userId);
  res.json({ message: 'Order cancelled' });
};
