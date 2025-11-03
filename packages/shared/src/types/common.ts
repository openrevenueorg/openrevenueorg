/**
 * Common types shared across OpenRevenue platform and standalone app
 */

export type PaymentProvider = 'stripe' | 'paddle' | 'lemon_squeezy' | 'paypal';

export type ConnectionType = 'direct' | 'standalone';

export type PrivacyLevel = 'public' | 'range' | 'hidden';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export type TimeInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RevenueMetrics {
  mrr: number;
  arr: number;
  totalRevenue: number;
  customerCount: number;
  growthRate: number;
  currency: Currency;
  timestamp: Date;
}

export interface RevenueDataPoint {
  date: string; // ISO date string
  revenue: number;
  mrr?: number;
  customerCount?: number;
  currency: Currency;
}

export interface ConnectionConfig {
  type: ConnectionType;
  provider: PaymentProvider;
  // For direct connections
  apiKey?: string;
  apiSecret?: string;
  // For standalone connections
  endpoint?: string;
  standaloneApiKey?: string;
}

export interface PrivacySettings {
  showRevenue: PrivacyLevel;
  showMRR: PrivacyLevel;
  showCustomerCount: PrivacyLevel;
  showGrowthRate: boolean;
  historicalMonths: number; // How many months of data to show publicly
}

export interface StartupProfile {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  category?: string;
  foundedDate?: Date;
  privacySettings: PrivacySettings;
}

export interface DataSignature {
  data: string; // JSON stringified data
  signature: string; // Cryptographic signature
  publicKey: string; // Public key for verification
  timestamp: number;
  version: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  lastSync?: Date;
  message?: string;
  publicKey?: string; // Public key for cryptographic verification
  timestamp?: number; // Timestamp of health check
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
