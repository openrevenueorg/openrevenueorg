/**
 * Database initialization script
 */

import { initDatabase } from '../src/database';
import { logger } from '../src/utils/logger';

async function main() {
  try {
    logger.info('Initializing database...');
    await initDatabase();
    logger.info('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

main();
