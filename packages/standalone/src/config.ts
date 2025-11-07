/**
 * Configuration management
 */

import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

export interface Config {
  env: string;
  port: number;
  jwtSecret: string;
  sessionSecret: string;
  databaseUrl: string;
  syncInterval: number;
  webUiEnabled: boolean;
  startupName: string;
  startupDescription: string;
  signingPrivateKey?: string;
  openrevenuePlatformUrl?: string;
  allowedOrigins: string[];
}

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config: Config = {
  env: getEnv('NODE_ENV', 'development'),
  port: parseInt(getEnv('API_PORT', '3001'), 10),
  jwtSecret: getEnv('JWT_SECRET'),
  sessionSecret: getEnv('SESSION_SECRET'),
  databaseUrl: getEnv(
    'DATABASE_URL',
    join(process.cwd(), 'data', 'openrevenue.db')
  ),
  syncInterval: parseInt(getEnv('SYNC_INTERVAL', '24'), 10),
  webUiEnabled: getEnv('WEB_UI_ENABLED', 'true') === 'true',
  startupName: getEnv('STARTUP_NAME', 'My Startup'),
  startupDescription: getEnv(
    'STARTUP_DESCRIPTION',
    'Transparent revenue tracking'
  ),
  signingPrivateKey: process.env.SIGNING_PRIVATE_KEY,
  openrevenuePlatformUrl: process.env.OPENREVENUE_PLATFORM_URL,
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['*'],
};
