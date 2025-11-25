/**
 * Unit tests for Dodo Payments provider
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DodoPaymentsProvider } from '../providers/dodopayments';

// Mock Dodo Payments SDK
vi.mock('dodopayments', () => {
    class MockDodoPayments {
        payments = {
            list: vi.fn().mockResolvedValue({
                items: [
                    {
                        payment_id: 'pay_1',
                        total_amount: 5000, // 50.00
                        currency: 'USD',
                        created_at: '2021-01-01T12:00:00Z',
                        status: 'succeeded',
                    },
                    {
                        payment_id: 'pay_2',
                        total_amount: 3000, // 30.00
                        currency: 'USD',
                        created_at: '2021-01-02T12:00:00Z',
                        status: 'succeeded',
                    },
                ],
            }),
        };
        subscriptions = {
            list: vi.fn().mockResolvedValue({
                items: [
                    {
                        subscription_id: 'sub_1',
                        customer: { customer_id: 'cust_1' },
                        recurring_pre_tax_amount: 5000, // 50.00
                        currency: 'USD',
                        status: 'active',
                    },
                ],
            }),
        };
        customers = {
            list: vi.fn().mockResolvedValue({
                items: [{ customer_id: 'cust_1' }],
            }),
        };

        constructor(_config?: any) { }
    }

    return {
        default: MockDodoPayments,
    };
});

describe('DodoPaymentsProvider', () => {
    let provider: DodoPaymentsProvider;

    beforeEach(() => {
        provider = new DodoPaymentsProvider({
            apiKey: 'dodo_test_12345',
            environment: 'test',
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
            // Check if revenue is correctly calculated (sum of payments)
            // 50 + 30 = 80
            // But they are on different days.
            // Monthly interval: both in Jan 2021.
            // So one entry with 80.
            expect(revenue[0].revenue).toBe(80);
        });
    });

    describe('fetchCurrentMetrics', () => {
        it('should fetch MRR, ARR, and customer count', async () => {
            const metrics = await provider.fetchCurrentMetrics();

            expect(metrics).toHaveProperty('mrr');
            expect(metrics).toHaveProperty('arr');
            expect(metrics).toHaveProperty('customerCount');
            expect(metrics).toHaveProperty('currency');
            expect(metrics.mrr).toBe(50); // 5000 cents = 50 USD
            expect(metrics.arr).toBe(600); // 50 * 12
            expect(metrics.customerCount).toBe(1);
        });
    });

    describe('fetchCustomerCount', () => {
        it('should return customer count (mocked as 0 for now)', async () => {
            const count = await provider.fetchCustomerCount();
            expect(typeof count).toBe('number');
            expect(count).toBe(0);
        });
    });
});
