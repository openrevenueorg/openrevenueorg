/**
 * Paddle payment provider integration
 */

import { Paddle, Environment } from '@paddle/paddle-node-sdk';
import {
  PaymentProvider,
  type PaymentProviderConfig,
  type FetchRevenueOptions,
  type ValidationResult,
} from './base';
import type { RevenueMetrics, RevenueDataPoint } from '@openrevenueorg/shared';

export class PaddleProvider extends PaymentProvider {
  private paddle: Paddle;

  constructor(config: PaymentProviderConfig) {
    super(config, 'paddle');
    this.paddle = new Paddle(config.apiKey, {
      environment: Environment.production, // Default to production
    });
  }

  async validateCredentials(): Promise<ValidationResult> {
    try {
      // Validate by making a lightweight API call
      await this.paddle.products.list({ perPage: 1 });
      return { valid: true };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Invalid Paddle credentials',
      };
    }
  }

  async fetchRevenue(options: FetchRevenueOptions): Promise<RevenueDataPoint[]> {
    const { startDate, endDate, interval = 'monthly', currency = 'USD' } = options;

    try {
      const revenueByDate = new Map<string, number>();
      let after: string | undefined;
      let hasMore = true;

      while (hasMore) {
        const transactionCollection = await this.paddle.transactions.list({
          perPage: 100,
          after,
          status: ['completed', 'paid'],
          createdAt: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }
        });

        const transactions = transactionCollection.data;

        if (transactions.length === 0) {
          hasMore = false;
          break;
        }

        for (const transaction of transactions) {
          const date = new Date(transaction.createdAt);
          const dateKey =
            interval === 'daily'
              ? date.toISOString().split('T')[0]
              : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

          const amount = parseFloat(transaction.details?.totals?.total || '0');
          revenueByDate.set(dateKey, (revenueByDate.get(dateKey) || 0) + amount);
        }

        if (transactionCollection.meta.pagination.hasMore) {
          after = transactionCollection.meta.pagination.next;
        } else {
          hasMore = false;
        }
      }

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
      let mrr = 0;
      let after: string | undefined;
      let hasMore = true;
      const uniqueCustomers = new Set<string>();

      while (hasMore) {
        const subCollection = await this.paddle.subscriptions.list({
          perPage: 100,
          status: ['active'],
          after
        });

        for (const sub of subCollection.data) {
          if (sub.recurringTransactionDetails) {
            const amount = parseFloat(sub.recurringTransactionDetails.totals?.total || '0');
            const interval = sub.billingCycle.interval;

            if (interval === 'month') {
              mrr += amount;
            } else if (interval === 'year') {
              mrr += amount / 12;
            }
          }

          if (sub.customerId) {
            uniqueCustomers.add(sub.customerId);
          }
        }

        if (subCollection.meta.pagination.hasMore) {
          after = subCollection.meta.pagination.next;
        } else {
          hasMore = false;
        }
      }

      // Calculate total revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const revenuePoints = await this.fetchRevenue({
        startDate: thirtyDaysAgo,
        endDate: new Date(),
        interval: 'monthly'
      });

      const totalRevenue = revenuePoints.reduce((sum, p) => sum + p.revenue, 0);

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
      // Paddle doesn't have a direct count endpoint, need to iterate or estimate
      // Using subscription count as proxy for now or we can iterate customers
      // Iterating customers might be slow if many.
      // Let's iterate customers for accuracy but limit if needed.
      // For now, let's just count active subscriptions unique customers as in fetchCurrentMetrics
      // Or we can use the customers endpoint

      let count = 0;
      let after: string | undefined;
      let hasMore = true;

      while (hasMore) {
        const customerCollection = await this.paddle.customers.list({
          perPage: 100,
          after
        });

        count += customerCollection.data.length;

        if (customerCollection.meta.pagination.hasMore) {
          after = customerCollection.meta.pagination.next;
        } else {
          hasMore = false;
        }
      }

      return count;
    } catch (error: any) {
      throw new Error(`Failed to fetch Paddle customer count: ${error.message}`);
    }
  }

  verifyWebhook(payload: any, signature: string): boolean {
    // TODO: Implement webhook verification using Paddle SDK
    // this.paddle.webhooks.unmarshal(payload, signature, secret);
    return true;
  }
}
