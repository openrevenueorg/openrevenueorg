/**
 * OpenRevenue Standalone App
 * Self-hosted revenue data provider
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import session from 'express-session';
import { config } from './config';
import { logger } from './utils/logger';
import { apiRouter } from './api/routes';
import { webRouter } from './web/routes';
import { initDatabase } from './database';
import { startScheduler } from './services/scheduler';
import { errorHandler } from './middleware/error-handler';

async function bootstrap() {
  const app = express();

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: config.env === 'production' ? undefined : false,
    })
  );
  app.use(
    cors({
      origin: config.allowedOrigins,
      credentials: true,
    })
  );

  // Session middleware
  app.use(
    session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: config.env === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Compression
  app.use(compression());

  // Logging
  if (config.env === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg) } }));
  }

  // Initialize database
  await initDatabase();
  logger.info('Database initialized');

  // Mount routes
  app.use('/api/v1', apiRouter);

  if (config.webUiEnabled) {
    app.use('/', webRouter);
  }

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Error handling
  app.use(errorHandler);

  // Start scheduler for background jobs
  startScheduler();
  logger.info('Scheduler started');

  // Start server
  app.listen(config.port, () => {
    logger.info(`OpenRevenue Standalone App running on port ${config.port}`);
    logger.info(`Environment: ${config.env}`);
    logger.info(`Web UI: ${config.webUiEnabled ? 'Enabled' : 'Disabled'}`);
  });
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

bootstrap().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});
