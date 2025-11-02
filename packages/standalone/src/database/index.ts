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

  // Settings table - stores startup configuration
  await run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      startup_name TEXT NOT NULL,
      startup_description TEXT,
      startup_website TEXT,
      startup_logo TEXT,
      startup_tagline TEXT,
      founder_name TEXT,
      founder_email TEXT,
      is_onboarded INTEGER DEFAULT 0,
      show_revenue INTEGER DEFAULT 1,
      show_mrr INTEGER DEFAULT 1,
      show_arr INTEGER DEFAULT 1,
      show_customers INTEGER DEFAULT 1,
      revenue_display_mode TEXT DEFAULT 'exact',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Users table - for admin authentication
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_login_at TEXT
    )
  `);

  // Sessions table - for web UI authentication
  await run(`
    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expire TEXT NOT NULL
    )
  `);

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
  await run('CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire)');
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

// Settings helpers
export async function getSettings(): Promise<any | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM settings WHERE id = 1', (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

export async function isOnboarded(): Promise<boolean> {
  const settings = await getSettings();
  return settings?.is_onboarded === 1;
}

export async function upsertSettings(settings: any): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO settings (
        id, startup_name, startup_description, startup_website,
        startup_logo, startup_tagline, founder_name, founder_email,
        is_onboarded, show_revenue, show_mrr, show_arr,
        show_customers, revenue_display_mode, updated_at
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        startup_name = excluded.startup_name,
        startup_description = excluded.startup_description,
        startup_website = excluded.startup_website,
        startup_logo = excluded.startup_logo,
        startup_tagline = excluded.startup_tagline,
        founder_name = excluded.founder_name,
        founder_email = excluded.founder_email,
        is_onboarded = excluded.is_onboarded,
        show_revenue = excluded.show_revenue,
        show_mrr = excluded.show_mrr,
        show_arr = excluded.show_arr,
        show_customers = excluded.show_customers,
        revenue_display_mode = excluded.revenue_display_mode,
        updated_at = CURRENT_TIMESTAMP`,
      [
        settings.startup_name,
        settings.startup_description,
        settings.startup_website,
        settings.startup_logo,
        settings.startup_tagline,
        settings.founder_name,
        settings.founder_email,
        settings.is_onboarded ? 1 : 0,
        settings.show_revenue ? 1 : 0,
        settings.show_mrr ? 1 : 0,
        settings.show_arr ? 1 : 0,
        settings.show_customers ? 1 : 0,
        settings.revenue_display_mode,
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

// User helpers
export async function createUser(user: {
  id: string;
  username: string;
  password_hash: string;
  email?: string;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (id, username, password_hash, email)
       VALUES (?, ?, ?, ?)`,
      [user.id, user.username, user.password_hash, user.email],
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

export async function getUserByUsername(username: string): Promise<any | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

export async function updateLastLogin(userId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId],
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
