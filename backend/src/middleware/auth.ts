import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.ts';
import { AppError } from '../utils/AppError.ts';

export const auth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = header.slice(7);

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
};
