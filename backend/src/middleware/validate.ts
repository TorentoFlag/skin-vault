import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../utils/AppError.ts';

type RequestField = 'body' | 'query' | 'params';

export const validate = (schema: z.ZodType, field: RequestField = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[field]);
    if (!result.success) {
      const message = result.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join(', ');
      throw new AppError(message, 400);
    }
    // Express 5: req.query and req.params are read-only getters
    Object.defineProperty(req, field, { value: result.data, writable: true, configurable: true });
    next();
  };
