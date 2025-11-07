/**
 * BullMQ Workers
 */

import { Worker, Job } from 'bullmq';
import { getRedis } from '@/lib/redis';
import { QUEUE_NAMES, type SyncRevenueJob, type LeaderboardRefreshJob, type MilestoneCheckJob } from './queues';
import { DataAggregator } from '@/server/aggregator';

// Job processors
async function processRevenueSync(job: Job<SyncRevenueJob>) {
  console.log(`Processing revenue sync for connection ${job.data.connectionId}`);
  
  const aggregator = new DataAggregator();
  const result = await aggregator.syncConnection(job.data.connectionId);
  
  if (!result.success && result.error) {
    throw new Error(result.error);
  }
  
  // Trigger milestone check after successful sync
  if (result.success) {
    await job.updateProgress(100);
  }
  
  return result;
}

async function processLeaderboardRefresh(_job: Job<LeaderboardRefreshJob>) {
  console.log('Refreshing leaderboard...');
  
  const aggregator = new DataAggregator();
  await aggregator.updateLeaderboard();
  
  return { success: true };
}

async function processMilestoneCheck(job: Job<MilestoneCheckJob>) {
  console.log(`Checking milestones for startup ${job.data.startupId}`);
  
  // TODO: Implement milestone detection logic
  // This would check revenue data against milestone targets
  // and create milestone records if achieved
  
  return { success: true };
}

// Create workers
export const workers = {
  revenueSync: new Worker<SyncRevenueJob>(
    QUEUE_NAMES.REVENUE_SYNC,
    processRevenueSync,
    {
      connection: getRedis(),
      concurrency: 5,
      limiter: {
        max: 100,
        duration: 60000, // 100 jobs per minute
      },
    }
  ),
  
  leaderboardRefresh: new Worker<LeaderboardRefreshJob>(
    QUEUE_NAMES.LEADERBOARD_REFRESH,
    processLeaderboardRefresh,
    {
      connection: getRedis(),
      concurrency: 1, // Only one leaderboard refresh at a time
    }
  ),
  
  milestoneCheck: new Worker<MilestoneCheckJob>(
    QUEUE_NAMES.MILESTONE_CHECK,
    processMilestoneCheck,
    {
      connection: getRedis(),
      concurrency: 10,
    }
  ),
};

// Event listeners for monitoring
workers.revenueSync.on('completed', (job) => {
  console.log(`Revenue sync completed: ${job.id}`);
});

workers.revenueSync.on('failed', (job, err) => {
  console.error(`Revenue sync failed: ${job?.id}`, err);
});

workers.leaderboardRefresh.on('completed', (job) => {
  console.log(`Leaderboard refresh completed: ${job.id}`);
});

workers.leaderboardRefresh.on('failed', (job, err) => {
  console.error(`Leaderboard refresh failed: ${job?.id}`, err);
});

workers.milestoneCheck.on('completed', (job) => {
  console.log(`Milestone check completed: ${job.id}`);
});

workers.milestoneCheck.on('failed', (job, err) => {
  console.error(`Milestone check failed: ${job?.id}`, err);
});

// Graceful shutdown
export function closeAllWorkers() {
  return Promise.all([
    workers.revenueSync.close(),
    workers.leaderboardRefresh.close(),
    workers.milestoneCheck.close(),
  ]);
}

export function closeAllQueues() {
  return Promise.all([
    workers.revenueSync.close(),
    workers.leaderboardRefresh.close(),
    workers.milestoneCheck.close(),
  ]);
}

