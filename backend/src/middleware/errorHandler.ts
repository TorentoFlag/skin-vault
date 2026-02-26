import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.ts';
import { logger } from '../utils/logger.ts';
import { env } from '../config/env.ts';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    logger.warn({ statusCode: err.statusCode, message: err.message }, 'Operational error');
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  logger.error(err, 'Unhandled error');
  res.status(500).json({
    error: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
