/**
 * Payment provider interface
 */

export interface PaymentProvider {
  name: string;
  validateCredentials(credentials: Record<string, string>): Promise<boolean>;
  fetchRevenue(options: FetchRevenueOptions): Promise<RevenueData[]>;
  fetchCustomerCount(): Promise<number>;
}

export interface FetchRevenueOptions {
  startDate: Date;
  endDate: Date;
  credentials: Record<string, string>;
}

export interface RevenueData {
  date: Date;
  revenue: number;
  currency: string;
  mrr?: number;
  customerCount?: number;
}

export type ProviderType = 'stripe' | 'paddle' | 'lemonsqueezy' | 'paypal' | 'polar';

export interface ConnectionCredentials {
  provider: ProviderType;
  apiKey: string;
  webhookSecret?: string;
  vendorId?: string; // For Paddle
}
