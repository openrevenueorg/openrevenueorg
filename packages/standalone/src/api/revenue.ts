/**
 * Revenue data endpoints
 */

import { Router, type Router as ExpressRouter } from 'express';
import { verifyApiKey, verifyAuth } from '../middleware/auth';
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
revenueRouter.get('/current', verifyAuth, async (req, res, next) => {
  try {
    const metrics = await getCurrentMetrics();
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /revenue/public-stats
 * Get public-facing revenue statistics (no authentication required)
 */
revenueRouter.get('/public-stats', async (req, res, next) => {
  try {
    const metrics = await getCurrentMetrics();

    // Get last 12 months of data for the chart
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    const chartData = await getRevenueData({
      startDate,
      endDate,
      interval: 'monthly',
    });

    res.json({
      current_mrr: metrics.mrr || 0,
      current_arr: metrics.arr || 0,
      total_revenue: metrics.totalRevenue || 0,
      customer_count: metrics.customerCount || 0,
      growth_rate: metrics.growthRate || 0,
      chart_data: chartData,
    });
  } catch (error) {
    next(error);
  }
});
