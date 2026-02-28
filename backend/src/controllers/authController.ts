import type { Request, Response } from 'express';
import { prisma } from '../config/database.ts';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.ts';
import { AppError } from '../utils/AppError.ts';
import { env } from '../config/env.ts';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());

export const steamCallback = async (req: Request, res: Response) => {
  const steamUser = req.user;
  if (!steamUser?.steamId) {
    throw new AppError('Steam authentication failed', 401);
  }

  const user = await prisma.user.upsert({
    where: { steamId: steamUser.steamId },
    update: {
      displayName: steamUser.displayName ?? '',
      avatar: steamUser.avatar ?? '',
    },
    create: {
      steamId: steamUser.steamId,
      displayName: steamUser.displayName ?? '',
      avatar: steamUser.avatar ?? '',
    },
  });

  const tokenPayload = { userId: user.id, steamId: user.steamId };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Determine which frontend to redirect to
  const savedOrigin = req.cookies?.auth_origin as string | undefined;
  const redirectBase = savedOrigin && allowedOrigins.includes(savedOrigin)
    ? savedOrigin
    : allowedOrigins[0];

  // Clean up the origin cookie
  res.clearCookie('auth_origin', { path: '/' });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  res.redirect(`${redirectBase}/auth/callback?token=${accessToken}`);
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', { path: '/' });
  res.json({ message: 'Logged out' });
};

export const getMe = async (req: Request, res: Response) => {
  const userId = req.user!.userId!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json(user);
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) {
    throw new AppError('Refresh token required', 401);
  }

  try {
    const payload = verifyRefreshToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw new AppError('User not found', 401);
    }

    const tokenPayload = { userId: user.id, steamId: user.steamId };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Invalid refresh token', 401);
  }
};
