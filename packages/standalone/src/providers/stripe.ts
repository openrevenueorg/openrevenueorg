/**
 * Stripe payment provider implementation
 */

import Stripe from 'stripe';
import type { PaymentProvider, FetchRevenueOptions, RevenueData } from '../types/provider';
import { logger } from '../utils/logger';

export class StripeProvider implements PaymentProvider {
  name = 'stripe';

  async validateCredentials(credentials: Record<string, string>): Promise<boolean> {
    try {
      const stripe = new Stripe(credentials.apiKey, {
        apiVersion: '2025-02-24.acacia',
      });

      // Test API key by fetching account
      await stripe.accounts.retrieve();
      return true;
    } catch (error: any) {
      logger.error('Stripe credential validation failed:', error.message);
      return false;
    }
  }

  async fetchRevenue(options: FetchRevenueOptions): Promise<RevenueData[]> {
    const { startDate, endDate, credentials } = options;

    const stripe = new Stripe(credentials.apiKey, {
      apiVersion: '2025-02-24.acacia',
    });

    const revenueByDate = new Map<string, RevenueData>();

    try {
      // Fetch charges
      const charges = await stripe.charges.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(endDate.getTime() / 1000),
        },
        limit: 100,
      });

      for (const charge of charges.data) {
        if (charge.status === 'succeeded' && charge.paid) {
          const date = new Date(charge.created * 1000);
          const dateKey = date.toISOString().split('T')[0];

          const existing = revenueByDate.get(dateKey);
          if (existing) {
            existing.revenue += charge.amount / 100;
          } else {
            revenueByDate.set(dateKey, {
              date: new Date(dateKey),
              revenue: charge.amount / 100,
              currency: charge.currency.toUpperCase(),
            });
          }
        }
      }

      // Fetch subscriptions for MRR calculation
      const subscriptions = await stripe.subscriptions.list({
        status: 'active',
        limit: 100,
      });

      let totalMRR = 0;
      for (const sub of subscriptions.data) {
        if (sub.items.data.length > 0) {
          const price = sub.items.data[0].price;
          if (price.recurring?.interval === 'month') {
            totalMRR += (price.unit_amount || 0) / 100;
          } else if (price.recurring?.interval === 'year') {
            totalMRR += ((price.unit_amount || 0) / 100) / 12;
          }
        }
      }

      // Add MRR to the most recent date
      const dates = Array.from(revenueByDate.keys()).sort();
      if (dates.length > 0) {
        const latestDate = dates[dates.length - 1];
        const latestData = revenueByDate.get(latestDate)!;
        latestData.mrr = totalMRR;
      }

      return Array.from(revenueByDate.values()).sort((a, b) =>
        a.date.getTime() - b.date.getTime()
      );
    } catch (error: any) {
      logger.error('Failed to fetch Stripe revenue:', error.message);
      throw new Error(`Stripe API error: ${error.message}`);
    }
  }

  async fetchCustomerCount(): Promise<number> {
    throw new Error('Not implemented yet');
  }
}
