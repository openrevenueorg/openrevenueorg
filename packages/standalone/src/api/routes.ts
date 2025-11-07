/**
 * API routes
 */

import { Router, type Router as ExpressRouter } from 'express';
import { revenueRouter } from './revenue';
import { healthRouter } from './health';
import { apiKeysRouter } from './api-keys';
import { connectionsRouter } from './connections';
import { authRouter } from './auth';
import { settingsRouter } from './settings';
import { apiLimiter } from '../middleware/rate-limit';

export const apiRouter: ExpressRouter = Router();

// Apply rate limiting to all API routes
apiRouter.use(apiLimiter);

// Mount routes
apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/revenue', revenueRouter);
apiRouter.use('/api-keys', apiKeysRouter);
apiRouter.use('/connections', connectionsRouter);
