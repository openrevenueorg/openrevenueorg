/**
 * Authentication API routes
 */

import { Router, type Router as ExpressRouter } from 'express';
import { z } from 'zod';
import { createAdminUser, validateCredentials } from '../services/auth';
import { logger } from '../utils/logger';
import { isOnboarded } from '../database';

export const authRouter: ExpressRouter = Router();

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  email: z.string().email().optional(),
});

// Login endpoint
authRouter.post('/login', async (req, res, next) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await validateCredentials(username, password);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Set session
    (req.session as any).userId = user.id;
    (req.session as any).username = user.username;

    logger.info(`User logged in: ${username}`);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Register endpoint (only allowed during onboarding)
authRouter.post('/register', async (req, res, next) => {
  try {
    // Check if already onboarded
    const onboarded = await isOnboarded();
    if (onboarded) {
      return res.status(403).json({
        error: 'Registration is only allowed during onboarding',
      });
    }

    const { username, password, email } = registerSchema.parse(req.body);

    const user = await createAdminUser(username, password, email);

    // Set session
    (req.session as any).userId = user.id;
    (req.session as any).username = user.username;

    logger.info(`Admin user created: ${username}`);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Logout endpoint
authRouter.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error('Failed to destroy session:', err);
      return res.status(500).json({
        error: 'Failed to logout',
      });
    }

    res.json({
      success: true,
    });
  });
});

// Check authentication status
authRouter.get('/me', (req, res) => {
  const userId = (req.session as any)?.userId;
  const username = (req.session as any)?.username;

  if (!userId) {
    return res.status(401).json({
      authenticated: false,
    });
  }

  res.json({
    authenticated: true,
    user: {
      id: userId,
      username,
    },
  });
});
