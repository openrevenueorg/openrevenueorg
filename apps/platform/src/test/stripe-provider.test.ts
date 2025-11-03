/**
 * Unit tests for Stripe provider
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StripeProvider } from '@/providers/stripe';
import Stripe from 'stripe';

// Mock Stripe
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      balance: {
        retrieve: vi.fn().mockResolvedValue({ available: [{ amount: 1000, currency: 'usd' }] }),
      },
      charges: {
        list: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'ch_1',
              amount: 5000,
              currency: 'usd',
              created: 1609459200,
              paid: true,
              refunded: false,
              status: 'succeeded',
            },
            {
              id: 'ch_2',
              amount: 3000,
              currency: 'usd',
              created: 1609459200,
              paid: true,
              refunded: false,
              status: 'succeeded',
            },
          ],
        }),
      },
      subscriptions: {
        list: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'sub_1',
              customer: 'cus_1',
              items: {
                data: [
                  {
                    price: {
                      unit_amount: 5000,
                      recurring: { interval: 'month' },
                    },
                    quantity: 1,
                  },
                ],
              },
            },
          ],
        }),
      },
      customers: {
        list: vi.fn().mockResolvedValue({
          data: [{ id: 'cus_1' }],
          has_more: false,
        }),
      },
    })),
  };
});

describe('StripeProvider', () => {
  let provider: StripeProvider;

  beforeEach(() => {
    provider = new StripeProvider({
      apiKey: 'sk_test_12345',
    });
  });

  describe('validateCredentials', () => {
    it('should validate correct credentials', async () => {
      const result = await provider.validateCredentials();
      expect(result.valid).toBe(true);
    });
  });

  describe('fetchRevenue', () => {
    it('should fetch and aggregate revenue data', async () => {
      const startDate = new Date('2021-01-01');
      const endDate = new Date('2021-12-31');

      const revenue = await provider.fetchRevenue({
        startDate,
        endDate,
        interval: 'monthly',
      });

      expect(revenue.length).toBeGreaterThan(0);
      expect(revenue[0]).toHaveProperty('date');
      expect(revenue[0]).toHaveProperty('revenue');
      expect(revenue[0]).toHaveProperty('currency');
    });

    it('should group revenue by date interval', async () => {
      const startDate = new Date('2021-01-01');
      const endDate = new Date('2021-12-31');

      const revenue = await provider.fetchRevenue({
        startDate,
        endDate,
        interval: 'daily',
      });

      expect(revenue[0]).toHaveProperty('date');
    });
  });

  describe('fetchCurrentMetrics', () => {
    it('should fetch MRR, ARR, and customer count', async () => {
      const metrics = await provider.fetchCurrentMetrics();

      expect(metrics).toHaveProperty('mrr');
      expect(metrics).toHaveProperty('arr');
      expect(metrics).toHaveProperty('customerCount');
      expect(metrics).toHaveProperty('currency');
    });

    it('should calculate ARR as 12x MRR', async () => {
      const metrics = await provider.fetchCurrentMetrics();
      expect(metrics.arr).toBe(metrics.mrr * 12);
    });
  });

  describe('fetchCustomerCount', () => {
    it('should return customer count', async () => {
      const count = await provider.fetchCustomerCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});

