import { Router } from 'express';
import { passport } from '../config/passport.ts';
import { auth } from '../middleware/auth.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';
import * as authController from '../controllers/authController.ts';
import { env } from '../config/env.ts';

const router = Router();

const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());

// Steam OpenID login — save origin, then redirect to Steam
router.get('/steam', (req, res, next) => {
  const origin = req.get('Referer');
  if (origin) {
    const originUrl = new URL(origin);
    const originBase = originUrl.origin;
    if (allowedOrigins.includes(originBase)) {
      res.cookie('auth_origin', originBase, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 5 * 60 * 1000, // 5 minutes — enough for Steam login
        path: '/',
      });
    }
  }
  passport.authenticate('steam', { session: false })(req, res, next);
}, );

// Steam callback — handle return from Steam
router.get(
  '/steam/callback',
  passport.authenticate('steam', { session: false, failureRedirect: '/' }),
  asyncHandler(authController.steamCallback),
);

// Logout — clear refresh token cookie
router.post('/logout', authController.logout);

// Get current user profile (requires auth)
router.get('/me', auth, asyncHandler(authController.getMe));

// Refresh access token using refresh token cookie
router.post('/refresh', asyncHandler(authController.refreshToken));

export default router;
