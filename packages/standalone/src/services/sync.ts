/**
 * Data synchronization service
 */

import { randomBytes } from 'crypto';
import { getActiveConnections, insertRevenueData, insertSyncLog, getDatabase } from '../database';
import { getConnectionCredentials } from '../api/connections';
import { getProvider } from '../providers';
import { logger } from '../utils/logger';
import { promisify } from 'util';

export async function syncAllConnections(): Promise<void> {
  const connections = await getActiveConnections();

  logger.info(`Found ${connections.length} active connections to sync`);

  for (const connection of connections) {
    try {
      await syncConnection(connection.id);
    } catch (error: any) {
      logger.error(`Failed to sync connection ${connection.id}:`, error);
    }
  }
}

async function syncConnection(connectionId: string): Promise<void> {
  const startTime = new Date();
  const logId = randomBytes(16).toString('hex');

  try {
    logger.info(`Starting sync for connection ${connectionId}`);

    // Get connection credentials
    const credentials = await getConnectionCredentials(connectionId);
    const provider = getProvider(credentials.provider);

    // Fetch revenue data from the last 90 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const revenueData = await provider.fetchRevenue({
      startDate,
      endDate,
      credentials: {
        apiKey: credentials.apiKey,
        webhookSecret: credentials.webhookSecret || '',
      },
    });

    // Insert revenue data into database
    let recordsProcessed = 0;
    for (const data of revenueData) {
      const id = randomBytes(16).toString('hex');
      await insertRevenueData({
        id,
        connectionId,
        date: data.date.toISOString(),
        revenue: data.revenue,
        mrr: data.mrr,
        arr: data.mrr ? data.mrr * 12 : undefined,
        customerCount: data.customerCount,
        currency: data.currency,
      });
      recordsProcessed++;
    }

    // Update last synced time
    const db = getDatabase();
    const run = promisify(db.run.bind(db)) as (sql: string, params: any[]) => Promise<void>;
    await run(
      'UPDATE connections SET last_synced_at = CURRENT_TIMESTAMP WHERE id = ?',
      [connectionId]
    );

    await insertSyncLog({
      id: logId,
      connectionId,
      status: 'success',
      recordsProcessed,
      startedAt: startTime.toISOString(),
      completedAt: new Date().toISOString(),
    });

    logger.info(`Sync completed for connection ${connectionId}. Processed ${recordsProcessed} records.`);
  } catch (error: any) {
    await insertSyncLog({
      id: logId,
      connectionId,
      status: 'error',
      recordsProcessed: 0,
      error: error.message,
      startedAt: startTime.toISOString(),
      completedAt: new Date().toISOString(),
    });

    throw error;
  }
}
