/**
 * API key management service
 */

import jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';
import { config } from '../config';
import { getDatabase } from '../database';
import { promisify } from 'util';

export interface ApiKey {
  id: string;
  name: string;
  key: string; // Only returned on creation
  expiresAt?: Date;
  createdAt: Date;
}

export async function createApiKey(
  name: string,
  expiresInDays?: number
): Promise<ApiKey> {
  const id = randomBytes(16).toString('hex');
  const key = jwt.sign({ id, name }, config.jwtSecret, {
    expiresIn: expiresInDays ? `${expiresInDays}d` : undefined,
  });

  const keyHash = createHash('sha256').update(key).digest('hex');
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : undefined;

  const db = getDatabase();
  const run = promisify(db.run.bind(db)) as (sql: string, params: any[]) => Promise<void>;

  await run(
    'INSERT INTO api_keys (id, name, key_hash, expires_at) VALUES (?, ?, ?, ?)',
    [id, name, keyHash, expiresAt?.toISOString()]
  );

  return {
    id,
    name,
    key,
    expiresAt,
    createdAt: new Date(),
  };
}

export async function listApiKeys(): Promise<
  Omit<ApiKey, 'key'>[]
> {
  const db = getDatabase();
  const all = promisify(db.all.bind(db)) as (sql: string) => Promise<any[]>;

  const rows = await all(
    'SELECT id, name, expires_at, created_at FROM api_keys WHERE revoked_at IS NULL'
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
    createdAt: new Date(row.created_at),
  }));
}

export async function revokeApiKey(id: string): Promise<void> {
  const db = getDatabase();
  const run = promisify(db.run.bind(db)) as (sql: string, params: any[]) => Promise<void>;

  await run('UPDATE api_keys SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?', [
    id,
  ]);
}
