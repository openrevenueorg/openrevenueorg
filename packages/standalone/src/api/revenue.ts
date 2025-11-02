/**
 * Revenue data endpoints
 */

import { Router, type Router as ExpressRouter } from 'express';
import { verifyApiKey } from '../middleware/auth';
import { getRevenueData, getCurrentMetrics } from '../services/revenue';
import { signData } from '../services/crypto';
import { fetchRevenueRequestSchema } from '@openrevenue/shared';
import { AppError } from '../middleware/error-handler';
import { ERROR_CODES } from '@openrevenue/shared';

export const revenueRouter: ExpressRouter = Router();

/**
 * POST /revenue
 * Fetch revenue data for a date range
 */
revenueRouter.post('/', verifyApiKey, async (req, res, next) => {
  try {
    const validation = fetchRevenueRequestSchema.safeParse(req.body);

    if (!validation.success) {
      throw new AppError(
        ERROR_CODES.INVALID_INPUT,
        400,
        'Invalid request parameters',
        validation.error.errors
      );
    }

    const { startDate, endDate, interval } = validation.data;

    const data = await getRevenueData({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      interval: interval || 'monthly',
    });

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /revenue/signed
 * Fetch revenue data with cryptographic signature
 */
revenueRouter.post('/signed', verifyApiKey, async (req, res, next) => {
  try {
    const validation = fetchRevenueRequestSchema.safeParse(req.body);

    if (!validation.success) {
      throw new AppError(
        ERROR_CODES.INVALID_INPUT,
        400,
        'Invalid request parameters',
        validation.error.errors
      );
    }

    const { startDate, endDate, interval } = validation.data;

    const data = await getRevenueData({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      interval: interval || 'monthly',
    });

    // Sign the data
    const signedData = signData(data);

    res.json(signedData);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /revenue/current
 * Get current metrics (MRR, ARR, customer count)
 */
revenueRouter.get('/current', verifyApiKey, async (req, res, next) => {
  try {
    const metrics = await getCurrentMetrics();
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});
