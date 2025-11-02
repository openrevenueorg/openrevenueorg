/**
 * Shared constants
 */

export const API_VERSION = 'v1';

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as const;

export const SUPPORTED_PROVIDERS = [
  'stripe',
  'paddle',
  'lemon_squeezy',
  'paypal',
] as const;

export const RATE_LIMITS = {
  PUBLIC: 100, // requests per hour
  AUTHENTICATED: 1000, // requests per hour
  WEBHOOK: 10000, // requests per hour
} as const;

export const CACHE_TTL = {
  LEADERBOARD: 3600, // 1 hour
  STARTUP_PAGE: 300, // 5 minutes
  USER_SESSION: 604800, // 7 days
  REVENUE_STATS: 300, // 5 minutes
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const DATA_SIGNATURE_VERSION = '1.0';

export const SYNC_INTERVALS = {
  DAILY: 24,
  WEEKLY: 168,
  MONTHLY: 720,
} as const;

export const ERROR_CODES = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // Validation
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',

  // Provider
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  INVALID_API_KEY: 'INVALID_API_KEY',
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',

  // Data
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  INVALID_SIGNATURE: 'INVALID_SIGNATURE',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;
