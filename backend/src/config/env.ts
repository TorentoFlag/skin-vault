import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.string().url(),

  STEAM_API_KEY: z.string().min(1),
  STEAM_BOT_USERNAME: z.string().min(1),
  STEAM_BOT_PASSWORD: z.string().min(1),
  STEAM_SHARED_SECRET: z.string().min(1),
  STEAM_IDENTITY_SECRET: z.string().min(1),
  STEAM_BOT_STEAM_ID: z.string().min(1),

  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),

  REDIS_URL: z.string().url(),

  CLIENT_URL: z.string().url(),
});

type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues
    .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  // eslint-disable-next-line no-console
  console.error(`\nEnvironment validation failed:\n${missing}\n`);

  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv !== 'development') {
    process.exit(1);
  }
}

const fallbackEnv: Env = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: (process.env.NODE_ENV as Env['NODE_ENV']) || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  STEAM_API_KEY: process.env.STEAM_API_KEY || '',
  STEAM_BOT_USERNAME: process.env.STEAM_BOT_USERNAME || '',
  STEAM_BOT_PASSWORD: process.env.STEAM_BOT_PASSWORD || '',
  STEAM_SHARED_SECRET: process.env.STEAM_SHARED_SECRET || '',
  STEAM_IDENTITY_SECRET: process.env.STEAM_IDENTITY_SECRET || '',
  STEAM_BOT_STEAM_ID: process.env.STEAM_BOT_STEAM_ID || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  REDIS_URL: process.env.REDIS_URL || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

export const env: Env = parsed.success ? parsed.data : fallbackEnv;
