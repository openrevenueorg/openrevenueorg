/**
 * Base payment provider interface
 * All payment provider integrations must implement this interface
 */

import type {
  RevenueMetrics,
  RevenueDataPoint,
  Currency,
} from '@openrevenue/shared';

export interface PaymentProviderConfig {
  apiKey: string;
  apiSecret?: string;
  environment?: 'test' | 'live';
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface FetchRevenueOptions extends DateRange {
  interval?: 'daily' | 'monthly';
  currency?: Currency;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export abstract class PaymentProvider {
  protected config: PaymentProviderConfig;
  protected name: string;

  constructor(config: PaymentProviderConfig, name: string) {
    this.config = config;
    this.name = name;
  }

  /**
   * Validate API credentials
   */
  abstract validateCredentials(): Promise<ValidationResult>;

  /**
   * Fetch revenue data for a date range
   */
  abstract fetchRevenue(
    options: FetchRevenueOptions
  ): Promise<RevenueDataPoint[]>;

  /**
   * Fetch current metrics (MRR, ARR, customer count)
   */
  abstract fetchCurrentMetrics(): Promise<RevenueMetrics>;

  /**
   * Get customer count
   */
  abstract fetchCustomerCount(): Promise<number>;

  /**
   * Verify webhook signature (for real-time updates)
   */
  abstract verifyWebhook(payload: any, signature: string): boolean;

  /**
   * Get provider name
   */
  getName(): string {
    return this.name;
  }
}
