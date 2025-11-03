/**
 * BullMQ Queue Definitions
 */

import { Queue } from 'bullmq';
import { getRedis } from '@/lib/redis';

// Job data interfaces
export interface SyncRevenueJob {
  connectionId: string;
  startupId: string;
  force?: boolean;
}

export interface LeaderboardRefreshJob {
  date?: string;
}

export interface MilestoneCheckJob {
  startupId: string;
}

// Queue names
export const QUEUE_NAMES = {
  REVENUE_SYNC: 'revenue-sync',
  LEADERBOARD_REFRESH: 'leaderboard-refresh',
  MILESTONE_CHECK: 'milestone-check',
} as const;

// Create queues
export const queues = {
  revenueSync: new Queue<SyncRevenueJob>(QUEUE_NAMES.REVENUE_SYNC, {
    connection: getRedis(),
  }),
  leaderboardRefresh: new Queue<LeaderboardRefreshJob>(QUEUE_NAMES.LEADERBOARD_REFRESH, {
    connection: getRedis(),
  }),
  milestoneCheck: new Queue<MilestoneCheckJob>(QUEUE_NAMES.MILESTONE_CHECK, {
    connection: getRedis(),
  }),
};

// Graceful shutdown
export function closeAllQueues() {
  return Promise.all([
    queues.revenueSync.close(),
    queues.leaderboardRefresh.close(),
    queues.milestoneCheck.close(),
  ]);
}

