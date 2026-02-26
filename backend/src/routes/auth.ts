import { Router } from 'express';
import { passport } from '../config/passport.ts';
import { auth } from '../middleware/auth.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';
import * as authController from '../controllers/authController.ts';

const router = Router();

// Steam OpenID login — redirect to Steam
router.get('/steam', passport.authenticate('steam', { session: false }));

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
