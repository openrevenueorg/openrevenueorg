/**
 * API routes
 */

import { Router, type Router as ExpressRouter } from 'express';
import { revenueRouter } from './revenue';
import { healthRouter } from './health';
import { apiKeysRouter } from './api-keys';
import { apiLimiter } from '../middleware/rate-limit';

export const apiRouter: ExpressRouter = Router();

// Apply rate limiting to all API routes
apiRouter.use(apiLimiter);

// Mount routes
apiRouter.use('/health', healthRouter);
apiRouter.use('/revenue', revenueRouter);
apiRouter.use('/api-keys', apiKeysRouter);
