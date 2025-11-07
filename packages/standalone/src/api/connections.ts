/**
 * Connection management endpoints
 */

import { Router, type Router as ExpressRouter } from 'express';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { config } from '../config';
import { getDatabase } from '../database';
import { promisify } from 'util';
import { getProvider } from '../providers';
import { AppError } from '../middleware/error-handler';
import { ERROR_CODES } from '@openrevenueorg/shared';
import type { ProviderType } from '../types/provider';
import { verifyAuth } from '../middleware/auth';

export const connectionsRouter: ExpressRouter = Router();

// Apply authentication to all connection routes
connectionsRouter.use(verifyAuth);

// Encryption key (derived from JWT secret)
const ENCRYPTION_KEY = Buffer.from(config.jwtSecret.padEnd(32, '0').slice(0, 32));

function encryptData(data: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptData(encrypted: string): string {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedData = parts[1];
  const decipher = createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * POST /connections
 * Create a new payment provider connection
 */
connectionsRouter.post('/', async (req, res, next) => {
  try {
    const { provider, apiKey, webhookSecret, vendorId } = req.body;

    if (!provider || !apiKey) {
      throw new AppError(
        ERROR_CODES.INVALID_INPUT,
        400,
        'Provider and API key are required'
      );
    }

    // Validate credentials
    const providerInstance = getProvider(provider as ProviderType);
    const isValid = await providerInstance.validateCredentials({ apiKey, webhookSecret, vendorId });

    if (!isValid) {
      throw new AppError(
        ERROR_CODES.INVALID_INPUT,
        400,
        'Invalid credentials'
      );
    }

    // Encrypt sensitive data
    const encryptedApiKey = encryptData(apiKey);
    const encryptedSecret = webhookSecret ? encryptData(webhookSecret) : null;

    const db = getDatabase();
    const run = promisify(db.run.bind(db)) as (sql: string, params: any[]) => Promise<void>;

    const id = randomBytes(16).toString('hex');

    await run(
      'INSERT INTO connections (id, provider, encrypted_api_key, encrypted_secret, is_active) VALUES (?, ?, ?, ?, 1)',
      [id, provider, encryptedApiKey, encryptedSecret]
    );

    res.json({
      id,
      provider,
      isActive: true,
      createdAt: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /connections
 * List all connections
 */
connectionsRouter.get('/', async (req, res, next) => {
  try {
    const db = getDatabase();
    const all = promisify(db.all.bind(db)) as (sql: string) => Promise<any[]>;

    const rows = await all(
      'SELECT id, provider, is_active, last_synced_at, created_at FROM connections ORDER BY created_at DESC'
    );

    res.json({
      connections: rows.map(row => ({
        id: row.id,
        provider: row.provider,
        isActive: row.is_active === 1,
        lastSyncedAt: row.last_synced_at,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /connections/:id
 * Get a specific connection
 */
connectionsRouter.get('/:id', async (req, res, next) => {
  try {
    const db = getDatabase();
    const get = promisify(db.get.bind(db)) as (sql: string, params: any[]) => Promise<any>;

    const row = await get(
      'SELECT id, provider, is_active, last_synced_at, created_at FROM connections WHERE id = ?',
      [req.params.id]
    );

    if (!row) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Connection not found');
    }

    res.json({
      id: row.id,
      provider: row.provider,
      isActive: row.is_active === 1,
      lastSyncedAt: row.last_synced_at,
      createdAt: row.created_at,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /connections/:id
 * Update connection status
 */
connectionsRouter.patch('/:id', async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      throw new AppError(ERROR_CODES.INVALID_INPUT, 400, 'isActive must be a boolean');
    }

    const db = getDatabase();
    const run = promisify(db.run.bind(db)) as (sql: string, params: any[]) => Promise<void>;

    await run(
      'UPDATE connections SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [isActive ? 1 : 0, req.params.id]
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /connections/:id
 * Delete a connection
 */
connectionsRouter.delete('/:id', async (req, res, next) => {
  try {
    const db = getDatabase();
    const run = promisify(db.run.bind(db)) as (sql: string, params: any[]) => Promise<void>;

    await run('DELETE FROM connections WHERE id = ?', [req.params.id]);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * Helper function to get decrypted credentials for a connection
 */
export async function getConnectionCredentials(connectionId: string): Promise<{
  provider: ProviderType;
  apiKey: string;
  webhookSecret?: string;
}> {
  const db = getDatabase();
  const get = promisify(db.get.bind(db)) as (sql: string, params: any[]) => Promise<any>;

  const row = await get(
    'SELECT provider, encrypted_api_key, encrypted_secret FROM connections WHERE id = ? AND is_active = 1',
    [connectionId]
  );

  if (!row) {
    throw new Error('Connection not found or inactive');
  }

  return {
    provider: row.provider,
    apiKey: decryptData(row.encrypted_api_key),
    webhookSecret: row.encrypted_secret ? decryptData(row.encrypted_secret) : undefined,
  };
}
