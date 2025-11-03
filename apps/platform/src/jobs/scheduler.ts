/**
 * Cron Job Scheduler
 */

import cron from 'node-cron';
import { prisma } from '@/lib/prisma';
import { queues } from './queues';

let isScheduled = false;

export function startScheduler(): void {
  if (isScheduled) {
    console.log('Scheduler already started');
    return;
  }
  
  console.log('Starting job scheduler...');
  
  // Daily revenue sync for all active connections (2 AM UTC)
  cron.schedule('0 2 * * *', async () => {
    console.log('Running scheduled revenue sync for all connections...');
    
    try {
      const connections = await prisma.dataConnection.findMany({
        where: {
          isActive: true,
          OR: [
            { lastSyncedAt: null },
            { lastSyncedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, // Older than 24 hours
          ],
        },
        select: {
          id: true,
          startupId: true,
        },
      });
      
      console.log(`Found ${connections.length} connections to sync`);
      
      for (const connection of connections) {
        await queues.revenueSync.add('sync-connection', {
          connectionId: connection.id,
          startupId: connection.startupId,
          force: false,
        });
      }
    } catch (error) {
      console.error('Error scheduling revenue sync:', error);
    }
  });
  
  // Hourly leaderboard refresh
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled leaderboard refresh...');
    
    try {
      await queues.leaderboardRefresh.add('refresh-leaderboard', {});
    } catch (error) {
      console.error('Error scheduling leaderboard refresh:', error);
    }
  });
  
  // Daily milestone check for all startups (3 AM UTC)
  cron.schedule('0 3 * * *', async () => {
    console.log('Running scheduled milestone checks...');
    
    try {
      const startups = await prisma.startup.findMany({
        where: {
          isPublished: true,
        },
        select: {
          id: true,
        },
      });
      
      console.log(`Found ${startups.length} startups to check for milestones`);
      
      for (const startup of startups) {
        await queues.milestoneCheck.add('check-milestones', {
          startupId: startup.id,
        });
      }
    } catch (error) {
      console.error('Error scheduling milestone checks:', error);
    }
  });
  
  // Weekly featured startup rotation (Monday 12 AM UTC)
  cron.schedule('0 0 * * 1', async () => {
    console.log('Running featured startup rotation...');
    
    try {
      // Get all published startups
      const publishedStartups = await prisma.startup.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 10, // Rotate top 10
      });
      
      // Clear all featured flags
      await prisma.startup.updateMany({
        where: {},
        data: { isFeatured: false },
      });
      
      // Set new featured startups
      const featuredIds = publishedStartups
        .sort(() => 0.5 - Math.random()) // Randomize
        .slice(0, 3)
        .map(s => s.id);
      
      await prisma.startup.updateMany({
        where: { id: { in: featuredIds } },
        data: { isFeatured: true },
      });
      
      console.log(`Updated featured startups: ${featuredIds.join(', ')}`);
    } catch (error) {
      console.error('Error rotating featured startups:', error);
    }
  });
  
  isScheduled = true;
  console.log('Scheduler started successfully');
}

export function stopScheduler(): void {
  // Cron doesn't have a stop method, but we can track state
  isScheduled = false;
  console.log('Scheduler stopped');
}

