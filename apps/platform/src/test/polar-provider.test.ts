/**
 * Unit tests for Polar provider
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PolarProvider } from '../providers/polar';

// Mock Polar SDK
vi.mock('@polar-sh/sdk', () => {
    class MockPolar {
        users = {
            getAuthenticated: vi.fn().mockResolvedValue({ id: 'user_1', email: 'test@example.com' }),
        };
        orders = {
            list: vi.fn().mockResolvedValue({
                result: {
                    items: [
                        {
                            id: 'order_1',
                            amount: 5000,
                            currency: 'usd',
                            createdAt: '2021-01-01T12:00:00Z',
                            status: 'succeeded',
                        },
                        {
                            id: 'order_2',
                            amount: 3000,
                            currency: 'usd',
                            createdAt: '2021-01-02T12:00:00Z',
                            status: 'succeeded',
                        },
                    ],
                    pagination: {
                        total: 2,
                        maxPage: 1,
                    },
                },
            }),
        };
        subscriptions = {
            list: vi.fn().mockResolvedValue({
                result: {
                    items: [
                        {
                            id: 'sub_1',
                            userId: 'user_1',
                            amount: 5000,
                            currency: 'usd',
                            status: 'active',
                            recurringInterval: 'month',
                        },
                    ],
                    pagination: {
                        total: 1,
                        maxPage: 1,
                    },
                },
            }),
        };

        constructor(_config?: any) { }
    }

    return {
        Polar: MockPolar,
    };
});

describe('PolarProvider', () => {
    let provider: PolarProvider;

    beforeEach(() => {
        provider = new PolarProvider({
            apiKey: 'polar_test_12345',
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
        });
    });

    describe('fetchCustomerCount', () => {
        it('should return customer count', async () => {
            const count = await provider.fetchCustomerCount();
            expect(typeof count).toBe('number');
            expect(count).toBe(1);
        });
    });
});
