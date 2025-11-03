/**
 * Redis connection for BullMQ
 */

import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
    
    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });
  }
  
  return redis;
}

export function closeRedis(): void {
  if (redis) {
    redis.quit();
    redis = null;
  }
}

