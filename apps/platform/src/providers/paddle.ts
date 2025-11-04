/**
 * Paddle payment provider integration
 */

import {
  PaymentProvider,
  type PaymentProviderConfig,
  type FetchRevenueOptions,
  type ValidationResult,
} from './base';
import type { RevenueMetrics, RevenueDataPoint } from '@openrevenueorg/shared';

export class PaddleProvider extends PaymentProvider {
  constructor(config: PaymentProviderConfig) {
    super(config, 'paddle');
  }

  async validateCredentials(): Promise<ValidationResult> {
    try {
      // Paddle uses vendor_id and auth_code
      // For now, validate by making a test API call
      const response = await fetch('https://vendors.paddle.com/api/2.0/product/get_products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendor_id: this.config.apiKey,
          vendor_auth_code: this.config.apiSecret,
        }),
      });

      if (!response.ok) {
        return {
          valid: false,
          error: 'Invalid Paddle credentials',
        };
      }

      return { valid: true };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Failed to validate Paddle credentials',
      };
    }
  }

  async fetchRevenue(options: FetchRevenueOptions): Promise<RevenueDataPoint[]> {
    const { startDate, endDate, interval = 'monthly', currency = 'USD' } = options;

    try {
      // Fetch transactions from Paddle API
      const response = await fetch('https://vendors.paddle.com/api/2.0/product/get_transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendor_id: this.config.apiKey,
          vendor_auth_code: this.config.apiSecret,
          from: startDate.toISOString().split('T')[0],
          to: endDate.toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Paddle transactions');
      }

      const data = await response.json();
      const transactions = data.response?.transactions || [];

      // Group by date based on interval
      const revenueByDate = new Map<string, number>();

      for (const transaction of transactions) {
        if (transaction.status !== 'completed') continue;

        const date = new Date(transaction.event_time);
        const dateKey =
          interval === 'daily'
            ? date.toISOString().split('T')[0]
            : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

        const amount = parseFloat(transaction.total || '0');
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
      throw new Error(`Failed to fetch Paddle revenue: ${error.message}`);
    }
  }

  async fetchCurrentMetrics(): Promise<RevenueMetrics> {
    try {
      // Fetch subscriptions for MRR calculation
      const response = await fetch('https://vendors.paddle.com/api/2.0/subscription/list_users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendor_id: this.config.apiKey,
          vendor_auth_code: this.config.apiSecret,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Paddle subscriptions');
      }

      const data = await response.json();
      const subscriptions = data.response || [];

      let mrr = 0;
      const uniqueCustomers = new Set<string>();

      for (const sub of subscriptions) {
        if (sub.state === 'active' && sub.next_payment) {
          uniqueCustomers.add(sub.email);
          
          // Calculate monthly revenue
          const amount = parseFloat(sub.next_payment.amount || '0');
          const currency = sub.currency || 'USD';
          
          // Convert to USD if needed (simplified)
          if (currency === 'USD') {
            mrr += amount;
          }
        }
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const revenue = await this.fetchRevenue({
        startDate: thirtyDaysAgo,
        endDate: new Date(),
        interval: 'monthly',
      });

      const totalRevenue = revenue.reduce((sum, point) => sum + point.revenue, 0);

      return {
        mrr,
        arr: mrr * 12,
        totalRevenue,
        customerCount: uniqueCustomers.size,
        growthRate: 0,
        currency: 'USD',
        timestamp: new Date(),
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch Paddle metrics: ${error.message}`);
    }
  }

  async fetchCustomerCount(): Promise<number> {
    try {
      const response = await fetch('https://vendors.paddle.com/api/2.0/subscription/list_users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendor_id: this.config.apiKey,
          vendor_auth_code: this.config.apiSecret,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Paddle subscriptions');
      }

      const data = await response.json();
      const subscriptions = data.response || [];
      const uniqueCustomers = new Set<string>();

      for (const sub of subscriptions) {
        if (sub.email) {
          uniqueCustomers.add(sub.email);
        }
      }

      return uniqueCustomers.size;
    } catch (error: any) {
      throw new Error(`Failed to fetch Paddle customer count: ${error.message}`);
    }
  }

  verifyWebhook(payload: any, signature: string): boolean {
    // Paddle webhook verification
    // Implementation would verify Paddle webhook signature
    // For now, return true (should implement proper verification)
    return true;
  }
}

