/**
 * Zod validation schemas for revenue data
 */
import { z } from 'zod';

export const currencySchema = z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']);

export const paymentProviderSchema = z.enum([
  'stripe',
  'paddle',
  'lemon_squeezy',
  'paypal',
]);

export const connectionTypeSchema = z.enum(['direct', 'standalone']);

export const privacyLevelSchema = z.enum(['public', 'range', 'hidden']);

export const revenueMetricsSchema = z.object({
  mrr: z.number().nonnegative(),
  arr: z.number().nonnegative(),
  totalRevenue: z.number().nonnegative(),
  customerCount: z.number().int().nonnegative(),
  currency: currencySchema,
  timestamp: z.date(),
});

export const revenueDataPointSchema = z.object({
  date: z.string().datetime(),
  revenue: z.number().nonnegative(),
  mrr: z.number().nonnegative().optional(),
  customerCount: z.number().int().nonnegative().optional(),
  currency: currencySchema,
});

export const privacySettingsSchema = z.object({
  showRevenue: privacyLevelSchema,
  showMRR: privacyLevelSchema,
  showARR: privacyLevelSchema,
  showCustomerCount: privacyLevelSchema,
  showGrowthRate: z.boolean(),
  historicalMonths: z.number().int().min(1).max(36), // 1-36 months
});

export const connectionConfigSchema = z.object({
  type: connectionTypeSchema,
  provider: paymentProviderSchema,
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  endpoint: z.string().url().optional(),
  standaloneApiKey: z.string().optional(),
});

export const dataSignatureSchema = z.object({
  data: z.string(),
  signature: z.string(),
  publicKey: z.string(),
  timestamp: z.number(),
  version: z.string(),
});

export const paginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// API Request Schemas
export const fetchRevenueRequestSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  interval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
});

export const healthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  uptime: z.number(),
  lastSync: z.date().optional(),
  message: z.string().optional(),
});
