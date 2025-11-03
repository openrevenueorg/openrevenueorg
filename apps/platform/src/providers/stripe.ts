/**
 * Stripe payment provider integration
 */

import Stripe from 'stripe';
import {
  PaymentProvider,
  type PaymentProviderConfig,
  type FetchRevenueOptions,
  type ValidationResult,
} from './base';
import type { RevenueMetrics, RevenueDataPoint } from '@openrevenue/shared';

export class StripeProvider extends PaymentProvider {
  private stripe: Stripe;

  constructor(config: PaymentProviderConfig) {
    super(config, 'stripe');
    this.stripe = new Stripe(config.apiKey, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    });
  }

  async validateCredentials(): Promise<ValidationResult> {
    try {
      await this.stripe.balance.retrieve();
      return { valid: true };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Invalid Stripe API key',
      };
    }
  }

  async fetchRevenue(options: FetchRevenueOptions): Promise<RevenueDataPoint[]> {
    const { startDate, endDate, interval = 'monthly', currency = 'USD' } = options;

    try {
      // Fetch all charges/invoices in the date range
      const charges = await this.stripe.charges.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(endDate.getTime() / 1000),
        },
        limit: 100,
      });

      // Group by date based on interval
      const revenueByDate = new Map<string, number>();

      for (const charge of charges.data) {
        if (!charge.paid || charge.refunded) continue;

        const date = new Date(charge.created * 1000);
        const dateKey =
          interval === 'daily'
            ? date.toISOString().split('T')[0]
            : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

        const amount = charge.amount / 100; // Convert from cents
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
      throw new Error(`Failed to fetch Stripe revenue: ${error.message}`);
    }
  }

  async fetchCurrentMetrics(): Promise<RevenueMetrics> {
    try {
      // Get active subscriptions for MRR calculation
      const subscriptions = await this.stripe.subscriptions.list({
        status: 'active',
        limit: 100,
      });

      let mrr = 0;
      let customerCount = 0;
      const uniqueCustomers = new Set<string>();

      for (const subscription of subscriptions.data) {
        // Calculate MRR from subscription
        const subMRR = this.calculateSubscriptionMRR(subscription);
        mrr += subMRR;

        // Count unique customers
        if (subscription.customer) {
          uniqueCustomers.add(
            typeof subscription.customer === 'string'
              ? subscription.customer
              : subscription.customer.id
          );
        }
      }

      customerCount = uniqueCustomers.size;

      // Get total revenue from recent charges (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentCharges = await this.stripe.charges.list({
        created: {
          gte: Math.floor(thirtyDaysAgo.getTime() / 1000),
        },
        limit: 100,
      });

      let totalRevenue = 0;
      for (const charge of recentCharges.data) {
        if (charge.paid && !charge.refunded) {
          totalRevenue += charge.amount / 100;
        }
      }

      return {
        mrr,
        arr: mrr * 12,
        totalRevenue,
        customerCount,
        growthRate: 0, // Growth rate requires historical data
        currency: 'USD',
        timestamp: new Date(),
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch Stripe metrics: ${error.message}`);
    }
  }

  async fetchCustomerCount(): Promise<number> {
    try {
      const customers = await this.stripe.customers.list({
        limit: 1,
      });
      return customers.has_more ? 1000 : customers.data.length;
    } catch (error: any) {
      throw new Error(`Failed to fetch customer count: ${error.message}`);
    }
  }

  verifyWebhook(payload: any, signature: string): boolean {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error('Webhook secret not configured');
      }

      this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate MRR from a subscription
   */
  private calculateSubscriptionMRR(subscription: Stripe.Subscription): number {
    let mrr = 0;

    for (const item of subscription.items.data) {
      const price = item.price;
      const quantity = item.quantity || 1;
      const amount = (price.unit_amount || 0) / 100;

      // Convert to monthly based on interval
      switch (price.recurring?.interval) {
        case 'month':
          mrr += amount * quantity;
          break;
        case 'year':
          mrr += (amount * quantity) / 12;
          break;
        case 'week':
          mrr += amount * quantity * 4.33; // Average weeks per month
          break;
        case 'day':
          mrr += amount * quantity * 30;
          break;
        default:
          // One-time payment, don't include in MRR
          break;
      }
    }

    return mrr;
  }
}
