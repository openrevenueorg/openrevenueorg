/**
 * Lemon Squeezy payment provider integration
 */

import {
  PaymentProvider,
  type PaymentProviderConfig,
  type FetchRevenueOptions,
  type ValidationResult,
} from './base';
import type { RevenueMetrics, RevenueDataPoint } from '@openrevenueorg/shared';

export class LemonSqueezyProvider extends PaymentProvider {
  private apiUrl = 'https://api.lemonsqueezy.com/v1';

  constructor(config: PaymentProviderConfig) {
    super(config, 'lemon_squeezy');
  }

  async validateCredentials(): Promise<ValidationResult> {
    try {
      // Validate by fetching stores
      const response = await fetch(`${this.apiUrl}/stores`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'application/vnd.api+json',
        },
      });

      if (!response.ok) {
        return {
          valid: false,
          error: 'Invalid Lemon Squeezy API key',
        };
      }

      return { valid: true };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Failed to validate Lemon Squeezy credentials',
      };
    }
  }

  async fetchRevenue(options: FetchRevenueOptions): Promise<RevenueDataPoint[]> {
    const { startDate, endDate, interval = 'monthly', currency = 'USD' } = options;

    try {
      // Fetch orders from Lemon Squeezy
      const response = await fetch(`${this.apiUrl}/orders`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'application/vnd.api+json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Lemon Squeezy orders');
      }

      const data = await response.json();
      const orders = data.data || [];

      // Group by date based on interval
      const revenueByDate = new Map<string, number>();

      for (const order of orders) {
        const orderDate = new Date(order.attributes.created_at);
        
        // Filter by date range
        if (orderDate < startDate || orderDate > endDate) continue;

        const dateKey =
          interval === 'daily'
            ? orderDate.toISOString().split('T')[0]
            : `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-01`;

        const amount = parseFloat(order.attributes.total_formatted || '0');
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
      throw new Error(`Failed to fetch Lemon Squeezy revenue: ${error.message}`);
    }
  }

  async fetchCurrentMetrics(): Promise<RevenueMetrics> {
    try {
      // Fetch subscriptions for MRR
      const response = await fetch(`${this.apiUrl}/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'application/vnd.api+json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Lemon Squeezy subscriptions');
      }

      const data = await response.json();
      const subscriptions = data.data || [];

      let mrr = 0;
      const uniqueCustomers = new Set<string>();

      for (const sub of subscriptions) {
        if (sub.attributes.status === 'active') {
          const customerEmail = sub.attributes.customer_email;
          if (customerEmail) {
            uniqueCustomers.add(customerEmail);
          }

          // Calculate MRR from subscription
          const amount = parseFloat(sub.attributes.renewal_price || '0');
          mrr += amount;
        }
      }

      // Fetch recent revenue
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
      throw new Error(`Failed to fetch Lemon Squeezy metrics: ${error.message}`);
    }
  }

  async fetchCustomerCount(): Promise<number> {
    try {
      const response = await fetch(`${this.apiUrl}/customers`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'application/vnd.api+json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Lemon Squeezy customers');
      }

      const data = await response.json();
      return data.meta?.page?.total || 0;
    } catch (error: any) {
      throw new Error(`Failed to fetch Lemon Squeezy customer count: ${error.message}`);
    }
  }

  verifyWebhook(payload: any, signature: string): boolean {
    // Lemon Squeezy webhook verification
    // Implementation would verify webhook signature
    // For now, return true (should implement proper verification)
    return true;
  }
}

