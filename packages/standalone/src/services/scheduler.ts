/**
 * Background job scheduler
 */

import cron from 'node-cron';
import { config } from '../config';
import { logger } from '../utils/logger';
import { syncAllConnections } from './sync';

export function startScheduler(): void {
  // Schedule revenue sync based on config
  const cronExpression = getCronExpression(config.syncInterval);

  logger.info(`Scheduling sync every ${config.syncInterval} hours`);

  cron.schedule(cronExpression, async () => {
    logger.info('Starting scheduled revenue sync...');
    try {
      await syncAllConnections();
      logger.info('Scheduled sync completed successfully');
    } catch (error: any) {
      logger.error('Scheduled sync failed:', error);
    }
  });

  // Run initial sync on startup
  setTimeout(async () => {
    logger.info('Running initial sync...');
    try {
      await syncAllConnections();
      logger.info('Initial sync completed');
    } catch (error: any) {
      logger.error('Initial sync failed:', error);
    }
  }, 5000); // Wait 5 seconds after startup
}

function getCronExpression(hours: number): string {
  // Generate cron expression based on hours
  if (hours === 24) {
    return '0 2 * * *'; // Daily at 2 AM
  } else if (hours === 12) {
    return '0 */12 * * *'; // Every 12 hours
  } else if (hours === 1) {
    return '0 * * * *'; // Every hour
  } else {
    return `0 */${hours} * * *`; // Every N hours
  }
}
