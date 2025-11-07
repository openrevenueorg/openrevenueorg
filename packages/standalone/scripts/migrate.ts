/**
 * Database migration script
 * This script runs database migrations for schema changes
 */

import { initDatabase } from '../src/database';
import { logger } from '../src/utils/logger';

async function main() {
  try {
    logger.info('Running database migrations...');
    
    // Initialize database which creates tables if they don't exist
    await initDatabase();
    
    // Add any additional migration logic here
    // For example, you could add new columns, indexes, etc.
    
    logger.info('Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Failed to run migrations:', error);
    process.exit(1);
  }
}

main();

