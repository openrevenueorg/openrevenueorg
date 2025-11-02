/**
 * Database layer using SQLite
 */

import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { config } from '../config';
import { logger } from '../utils/logger';
import { join, dirname } from 'path';
import { mkdir } from 'fs/promises';

let db: sqlite3.Database;

export async function initDatabase(): Promise<void> {
  // Ensure data directory exists
  const dbPath = config.databaseUrl.replace('file:', '');
  const dbDir = dirname(dbPath);

  try {
    await mkdir(dbDir, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') throw error;
  }

  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        logger.error('Failed to open database:', err);
        reject(err);
        return;
      }

      try {
        await createTables();
        logger.info('Database tables created');
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function createTables(): Promise<void> {
  const run = promisify(db.run.bind(db));

  // Connections table
  await run(`
    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      encrypted_api_key TEXT NOT NULL,
      encrypted_secret TEXT,
      is_active INTEGER DEFAULT 1,
      last_synced_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Revenue data table
  await run(`
    CREATE TABLE IF NOT EXISTS revenue_data (
      id TEXT PRIMARY KEY,
      connection_id TEXT NOT NULL,
      date TEXT NOT NULL,
      revenue REAL NOT NULL,
      mrr REAL,
      arr REAL,
      customer_count INTEGER,
      currency TEXT DEFAULT 'USD',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (connection_id) REFERENCES connections (id),
      UNIQUE (connection_id, date)
    )
  `);

  // Sync logs table
  await run(`
    CREATE TABLE IF NOT EXISTS sync_logs (
      id TEXT PRIMARY KEY,
      connection_id TEXT NOT NULL,
      status TEXT NOT NULL,
      records_processed INTEGER DEFAULT 0,
      error TEXT,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (connection_id) REFERENCES connections (id)
    )
  `);

  // API keys table
  await run(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      expires_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      revoked_at TEXT
    )
  `);

  // Create indexes
  await run('CREATE INDEX IF NOT EXISTS idx_revenue_date ON revenue_data(date)');
  await run('CREATE INDEX IF NOT EXISTS idx_revenue_connection ON revenue_data(connection_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_sync_logs_connection ON sync_logs(connection_id)');
}

export function getDatabase(): sqlite3.Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

// Helper functions for common queries

export async function getLastSyncTime(): Promise<Date | null> {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT MAX(completed_at) as last_sync FROM sync_logs WHERE status = ?',
      ['success'],
      (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row?.last_sync ? new Date(row.last_sync) : null);
      }
    );
  });
}

export async function getActiveConnections(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM connections WHERE is_active = 1',
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      }
    );
  });
}

export async function getRevenueDataByDateRange(
  startDate: Date,
  endDate: Date
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM revenue_data
       WHERE date >= ? AND date <= ?
       ORDER BY date ASC`,
      [startDate.toISOString(), endDate.toISOString()],
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      }
    );
  });
}

export async function insertRevenueData(data: {
  id: string;
  connectionId: string;
  date: string;
  revenue: number;
  mrr?: number;
  arr?: number;
  customerCount?: number;
  currency: string;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO revenue_data
       (id, connection_id, date, revenue, mrr, arr, customer_count, currency)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.connectionId,
        data.date,
        data.revenue,
        data.mrr,
        data.arr,
        data.customerCount,
        data.currency,
      ],
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
}

export async function insertSyncLog(log: {
  id: string;
  connectionId: string;
  status: string;
  recordsProcessed: number;
  error?: string;
  startedAt: string;
  completedAt?: string;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO sync_logs
       (id, connection_id, status, records_processed, error, started_at, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        log.id,
        log.connectionId,
        log.status,
        log.recordsProcessed,
        log.error,
        log.startedAt,
        log.completedAt,
      ],
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
}
