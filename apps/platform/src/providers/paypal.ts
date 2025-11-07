/**
 * PayPal payment provider integration
 */

import {
  PaymentProvider,
  type PaymentProviderConfig,
  type FetchRevenueOptions,
  type ValidationResult,
} from './base';
import type { RevenueMetrics, RevenueDataPoint } from '@openrevenueorg/shared';

export class PayPalProvider extends PaymentProvider {
  private apiUrl: string;

  constructor(config: PaymentProviderConfig) {
    super(config, 'paypal');
    // Determine API URL based on environment
    this.apiUrl = config.environment === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    try {
      // Create Basic Auth header
      const credentials = Buffer.from(
        `${this.config.apiKey}:${this.config.apiSecret || ''}`
      ).toString('base64');

      const response = await fetch(`${this.apiUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get PayPal access token');
      }

      const data = await response.json();
      return data.access_token;
    } catch (error: any) {
      throw new Error(`Failed to authenticate with PayPal: ${error.message}`);
    }
  }

  async validateCredentials(): Promise<ValidationResult> {
    try {
      await this.getAccessToken();
      return { valid: true };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Invalid PayPal credentials',
      };
    }
  }

  async fetchRevenue(options: FetchRevenueOptions): Promise<RevenueDataPoint[]> {
    const { startDate, endDate, interval = 'monthly', currency = 'USD' } = options;

    try {
      const accessToken = await this.getAccessToken();

      // Fetch transactions from PayPal
      const response = await fetch(`${this.apiUrl}/v1/reporting/transactions?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch PayPal transactions');
      }

      const data = await response.json();
      const transactions = data.transaction_details || [];

      // Group by date based on interval
      const revenueByDate = new Map<string, number>();

      for (const transaction of transactions) {
        if (transaction.transaction_info.transaction_status !== 'S') continue;

        const date = new Date(transaction.transaction_info.transaction_initiation_date);
        const dateKey =
          interval === 'daily'
            ? date.toISOString().split('T')[0]
            : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

        const amount = parseFloat(transaction.transaction_info.transaction_amount?.value || '0');
        revenueByDate.set(dateKey, (revenueByDate.get(dateKey) || 0) + amount);
      }

      // Convert to RevenueDataPoint array
      const dataPoints: RevenueDataPoint[] = Array.from(revenueByDate.entries())
        .map(([date, revenue]) => ({
          date: new Date(date).toISOString(),
          revenue,
          currency,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return dataPoints;
    } catch (error: any) {
      throw new Error(`Failed to fetch PayPal revenue: ${error.message}`);
    }
  }

  async fetchCurrentMetrics(): Promise<RevenueMetrics> {
    try {
      // PayPal doesn't have direct subscription data like Stripe
      // We'll need to calculate from transactions
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const revenue = await this.fetchRevenue({
        startDate: thirtyDaysAgo,
        endDate: new Date(),
        interval: 'monthly',
      });

      // Estimate MRR from monthly revenue
      const monthlyRevenue = revenue[revenue.length - 1]?.revenue || 0;
      const totalRevenue = revenue.reduce((sum, point) => sum + point.revenue, 0);

      // Customer count would need additional API call
      const customerCount = 0;

      return {
        mrr: monthlyRevenue,
        arr: monthlyRevenue * 12,
        totalRevenue,
        customerCount,
        growthRate: 0,
        currency: 'USD',
        timestamp: new Date(),
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch PayPal metrics: ${error.message}`);
    }
  }

  async fetchCustomerCount(): Promise<number> {
    // PayPal doesn't provide easy customer count
    // Would need to aggregate from transactions
    return 0;
  }

  verifyWebhook(_payload: any, _signature: string): boolean {
    // PayPal webhook verification
    // Implementation would verify PayPal webhook signature
    // For now, return true (should implement proper verification)
    return true;
  }
}

