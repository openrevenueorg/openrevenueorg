/**
 * Jobs Entry Point
 * 
 * Start all background job workers and schedulers
 * Can be run as a separate process from the main Next.js app
 */

import { startScheduler } from './scheduler';
import { workers } from './workers';
import { closeAllQueues, closeAllWorkers } from './workers';
import { closeRedis } from '@/lib/redis';

// Start everything
console.log('Starting background jobs...');

try {
  startScheduler();
  console.log('All background jobs started successfully');
} catch (error) {
  console.error('Error starting background jobs:', error);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  
  try {
    await Promise.all([
      closeAllWorkers(),
      closeAllQueues(),
      closeRedis(),
    ]);
    console.log('All background jobs stopped');
    process.exit(0);
  } catch (error) {
    console.error('Error shutting down:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  
  try {
    await Promise.all([
      closeAllWorkers(),
      closeAllQueues(),
      closeRedis(),
    ]);
    console.log('All background jobs stopped');
    process.exit(0);
  } catch (error) {
    console.error('Error shutting down:', error);
    process.exit(1);
  }
});

// Keep process alive
setInterval(() => {
  // Heartbeat to keep process running
}, 60000); // Check every minute

