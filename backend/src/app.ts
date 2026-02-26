import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { passport } from './config/passport.ts';
import { env } from './config/env.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import authRoutes from './routes/auth.ts';
import shopRoutes from './routes/shop.ts';
// TODO: uncomment when enabling full functionality
// import userRoutes from './routes/user.ts';
// import orderRoutes from './routes/order.ts';
// import paymentRoutes from './routes/payment.ts';

import type { Request, Response } from 'express';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
}));

// TODO: uncomment when enabling payments
// app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport (no sessions)
app.use(passport.initialize());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shop', shopRoutes);
// TODO: uncomment when enabling full functionality
// app.use('/api/users', userRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/payments', paymentRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use(errorHandler);

export default app;
