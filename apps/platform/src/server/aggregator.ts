/**
 * Data Aggregator Service
 * Coordinates fetching data from direct payment providers and standalone apps
 */

import { prisma } from '@/lib/prisma';
import { createProvider } from '@/providers';
import { StandaloneClient } from '@/standalone/client';
import { decryptApiKey } from '@/lib/encryption';
import type { RevenueDataPoint } from '@openrevenueorg/shared';

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  error?: string;
}

export class DataAggregator {
  /**
   * Sync revenue data for a startup
   */
  async syncStartup(startupId: string): Promise<SyncResult> {
    try {
      const startup = await prisma.startup.findUnique({
        where: { id: startupId },
        include: { connections: { where: { isActive: true } } },
      });

      if (!startup) {
        throw new Error('Startup not found');
      }

      let totalRecordsProcessed = 0;

      for (const connection of startup.connections) {
        const result = await this.syncConnection(connection.id);
        if (result.success) {
          totalRecordsProcessed += result.recordsProcessed;
        }
      }

      return {
        success: true,
        recordsProcessed: totalRecordsProcessed,
      };
    } catch (error: any) {
      return {
        success: false,
        recordsProcessed: 0,
        error: error.message,
      };
    }
  }

  /**
   * Sync data from a specific connection
   */
  async syncConnection(connectionId: string): Promise<SyncResult> {
    const startTime = new Date();
    let recordsProcessed = 0;
    let syncError: string | undefined;

    try {
      const connection = await prisma.dataConnection.findUnique({
        where: { id: connectionId },
      });

      if (!connection || !connection.isActive) {
        throw new Error('Connection not found or inactive');
      }

      let dataPoints: RevenueDataPoint[] = [];

      if (connection.type === 'direct') {
        // Fetch from direct payment provider
        dataPoints = await this.fetchFromProvider(connection);
      } else if (connection.type === 'standalone') {
        // Fetch from standalone app
        dataPoints = await this.fetchFromStandalone(connection);
      }

      // Store data points in database
      for (const point of dataPoints) {
        await prisma.revenueSnapshot.upsert({
          where: {
            startupId_date_sourceId: {
              startupId: connection.startupId,
              date: new Date(point.date),
              sourceId: connection.id,
            },
          },
          create: {
            startupId: connection.startupId,
            date: new Date(point.date),
            revenue: point.revenue,
            mrr: point.mrr,
            customerCount: point.customerCount,
            currency: point.currency,
            sourceType: connection.type,
            sourceId: connection.id,
            isVerified: connection.type === 'standalone', // Standalone data is cryptographically verified
            trustLevel: connection.trustLevel || 'SELF_REPORTED',
            verifiedBy: connection.type === 'direct' ? 'platform' : 'self',
          },
          update: {
            revenue: point.revenue,
            mrr: point.mrr,
            customerCount: point.customerCount,
            currency: point.currency,
            trustLevel: connection.trustLevel || 'SELF_REPORTED',
            verifiedBy: connection.type === 'direct' ? 'platform' : 'self',
          },
        });
        recordsProcessed++;
      }

      // Update connection sync status
      await prisma.dataConnection.update({
        where: { id: connectionId },
        data: {
          lastSyncedAt: new Date(),
          lastSyncStatus: 'success',
          lastSyncError: null,
        },
      });

      // Log successful sync
      await prisma.syncLog.create({
        data: {
          connectionId,
          status: 'success',
          recordsProcessed,
          startedAt: startTime,
          completedAt: new Date(),
        },
      });

      return {
        success: true,
        recordsProcessed,
      };
    } catch (error: any) {
      syncError = error.message;

      // Update connection with error
      await prisma.dataConnection.update({
        where: { id: connectionId },
        data: {
          lastSyncStatus: 'error',
          lastSyncError: syncError,
        },
      });

      // Log failed sync
      await prisma.syncLog.create({
        data: {
          connectionId,
          status: 'error',
          recordsProcessed,
          error: syncError,
          startedAt: startTime,
          completedAt: new Date(),
        },
      });

      return {
        success: false,
        recordsProcessed,
        error: syncError,
      };
    }
  }

  /**
   * Fetch data from direct payment provider
   */
  private async fetchFromProvider(connection: any): Promise<RevenueDataPoint[]> {
    if (!connection.encryptedApiKey) {
      throw new Error('API key not configured');
    }

    // Decrypt API key
    const apiKey = this.decryptKey(connection.encryptedApiKey);

    const provider = createProvider(connection.provider, {
      apiKey,
      apiSecret: connection.encryptedSecret
        ? this.decryptKey(connection.encryptedSecret)
        : undefined,
    });

    // Validate credentials
    const validation = await provider.validateCredentials();
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid credentials');
    }

    // Fetch data for last 12 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    return await provider.fetchRevenue({
      startDate,
      endDate,
      interval: 'monthly',
    });
  }

  /**
   * Fetch data from standalone app
   */
  private async fetchFromStandalone(
    connection: any
  ): Promise<RevenueDataPoint[]> {
    if (!connection.endpoint || !connection.standaloneApiKey) {
      throw new Error('Standalone app endpoint or API key not configured');
    }

    const client = new StandaloneClient({
      endpoint: connection.endpoint,
      apiKey: connection.standaloneApiKey,
      publicKey: connection.publicKey || undefined,
    });

    // Validate connection
    const isValid = await client.validateConnection();
    if (!isValid) {
      throw new Error('Failed to connect to standalone app');
    }

    // Fetch data for last 12 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    return await client.fetchRevenue({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }

  /**
   * Decrypt API key using AES-256-GCM
   */
  private decryptKey(encrypted: string): string {
    try {
      return decryptApiKey(encrypted);
    } catch (error) {
      console.error('Error decrypting API key:', error);
      throw new Error('Failed to decrypt API credentials');
    }
  }

  /**
   * Update leaderboard entries
   */
  async updateLeaderboard(): Promise<void> {
    // Get all published startups with recent revenue data
    const startups = await prisma.startup.findMany({
      where: { isPublished: true },
      include: {
        revenueSnapshots: {
          orderBy: { date: 'desc' },
          take: 2,
        },
        privacySettings: true,
      },
    });

    for (const startup of startups) {
      if (startup.revenueSnapshots.length === 0) continue;

      const latestSnapshot = startup.revenueSnapshots[0];
      const previousSnapshot = startup.revenueSnapshots[1];

      // Calculate growth rate
      let growthRate: number | null = null;
      if (previousSnapshot && previousSnapshot.mrr && latestSnapshot.mrr) {
        growthRate =
          ((latestSnapshot.mrr - previousSnapshot.mrr) /
            previousSnapshot.mrr) *
          100;
      }

      // Update or create leaderboard entry
      await prisma.leaderboardEntry.upsert({
        where: { startupId: startup.id },
        create: {
          startupId: startup.id,
          rank: 0, // Will be updated in ranking pass
          mrr: latestSnapshot.mrr || 0,
          arr: latestSnapshot.arr || 0,
          totalRevenue: latestSnapshot.revenue,
          customerCount: latestSnapshot.customerCount,
          growthRate,
          currency: latestSnapshot.currency,
          lastUpdated: new Date(),
        },
        update: {
          mrr: latestSnapshot.mrr || 0,
          arr: latestSnapshot.arr || 0,
          totalRevenue: latestSnapshot.revenue,
          customerCount: latestSnapshot.customerCount,
          growthRate,
          currency: latestSnapshot.currency,
          lastUpdated: new Date(),
        },
      });
    }

    // Update rankings
    const entries = await prisma.leaderboardEntry.findMany({
      orderBy: { mrr: 'desc' },
    });

    for (let i = 0; i < entries.length; i++) {
      await prisma.leaderboardEntry.update({
        where: { id: entries[i].id },
        data: { rank: i + 1 },
      });
    }
  }
}
