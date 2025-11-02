/**
 * Health check endpoints
 */

import { Router, type Router as ExpressRouter } from 'express';
import { getLastSyncTime } from '../database';
import type { HealthStatus } from '@openrevenue/shared';

export const healthRouter: ExpressRouter = Router();

healthRouter.get('/', async (req, res) => {
  try {
    const lastSync = await getLastSyncTime();
    const uptime = process.uptime();

    let status: HealthStatus['status'] = 'healthy';

    // Check if sync is stale (more than 48 hours)
    if (lastSync) {
      const hoursSinceSync =
        (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
      if (hoursSinceSync > 48) {
        status = 'degraded';
      }
    }

    const response: HealthStatus = {
      status,
      uptime,
      lastSync: lastSync || undefined,
      message:
        status === 'degraded'
          ? 'Data sync is overdue'
          : undefined,
    };

    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      uptime: process.uptime(),
      message: error.message,
    });
  }
});
