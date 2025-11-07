/**
 * Settings API routes
 */

import { Router, type Router as ExpressRouter } from 'express';
import { z } from 'zod';
import { getSettings, upsertSettings, isOnboarded } from '../database';
import { logger } from '../utils/logger';
import { verifyAuth } from '../middleware/auth';

export const settingsRouter: ExpressRouter = Router();

const settingsSchema = z.object({
  startup_name: z.string().min(1),
  startup_description: z.string().optional(),
  startup_website: z.string().url().optional().or(z.literal('')),
  startup_logo: z.string().optional(),
  startup_tagline: z.string().optional(),
  founder_name: z.string().optional(),
  founder_email: z.string().email().optional().or(z.literal('')),
  show_revenue: z.boolean().optional(),
  show_mrr: z.boolean().optional(),
  show_arr: z.boolean().optional(),
  show_customers: z.boolean().optional(),
  revenue_display_mode: z.enum(['exact', 'range', 'hidden']).optional(),
});

// Public endpoints (no auth required)

// Get settings
settingsRouter.get('/', async (req, res, next) => {
  try {
    const settings = await getSettings();
    res.json(settings || {});
  } catch (error) {
    next(error);
  }
});

// Check onboarding status
settingsRouter.get('/onboarding-status', async (req, res, next) => {
  try {
    const onboarded = await isOnboarded();
    res.json({ is_onboarded: onboarded });
  } catch (error) {
    next(error);
  }
});

// Protected endpoints (require auth)

// Update settings
// Special case: Allow unauthenticated access during onboarding, but require auth after
settingsRouter.put('/', async (req, res, next) => {
  try {
    const onboarded = await isOnboarded();

    // If already onboarded, require authentication
    if (onboarded) {
      // Check for valid auth
      const sessionUserId = (req.session as any)?.userId;
      const apiKey = req.headers['x-api-key'] as string;

      if (!sessionUserId && !apiKey) {
        return res.status(401).json({
          error: 'Authentication required',
        });
      }
    }

    const data = settingsSchema.parse(req.body);

    await upsertSettings({
      ...data,
      is_onboarded: onboarded ? 1 : 0,
    });

    logger.info('Settings updated');

    res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
});

// Complete onboarding
settingsRouter.post('/complete-onboarding', verifyAuth, async (req, res, next) => {
  try {
    const onboarded = await isOnboarded();
    if (onboarded) {
      return res.status(400).json({
        error: 'Already onboarded',
      });
    }

    const settings = await getSettings();
    if (!settings) {
      return res.status(400).json({
        error: 'Settings not configured',
      });
    }

    await upsertSettings({
      ...settings,
      is_onboarded: 1,
    });

    logger.info('Onboarding completed');

    res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
});
