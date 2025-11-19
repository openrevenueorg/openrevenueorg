/**
 * Paddle payment provider implementation
 */

import { Paddle, Environment } from '@paddle/paddle-node-sdk';
import type { PaymentProvider, FetchRevenueOptions, RevenueData } from '../types/provider';
import { logger } from '../utils/logger';

export class PaddleProvider implements PaymentProvider {
    name = 'paddle';

    async validateCredentials(credentials: Record<string, string>): Promise<boolean> {
        try {
            const paddle = new Paddle(credentials.apiKey, {
                environment: Environment.production, // Default to production, maybe make configurable?
            });

            // Test API key by fetching products (lightweight call)
            await paddle.products.list({ perPage: 1 });
            return true;
        } catch (error: any) {
            logger.error('Paddle credential validation failed:', error.message);
            return false;
        }
    }

    async fetchRevenue(options: FetchRevenueOptions): Promise<RevenueData[]> {
        const { startDate, endDate, credentials } = options;

        const paddle = new Paddle(credentials.apiKey, {
            environment: Environment.production,
        });

        const revenueByDate = new Map<string, RevenueData>();

        try {
            // Fetch transactions
            let transactionCollection: any = await paddle.transactions.list({
                perPage: 100,
                status: ['completed', 'paid'],
            });

            let hasMore = true;

            while (hasMore) {
                // Cast to any to access private data property or iterate if supported at runtime
                const collection = transactionCollection;
                const transactions = collection.data || [];

                let pageHasItems = false;
                for (const transaction of transactions) {
                    pageHasItems = true;
                    // Paddle transaction dates are ISO strings
                    const date = new Date(transaction.createdAt);
                    const dateKey = date.toISOString().split('T')[0];

                    // Filter by date
                    if (date < startDate || date > endDate) continue;

                    // Calculate total from payments
                    // Cast to any to avoid strict type checks on details
                    const details = transaction.details as any;
                    const revenueAmount = parseFloat(details?.totals?.total || '0');

                    const existing = revenueByDate.get(dateKey);
                    if (existing) {
                        existing.revenue += revenueAmount;
                    } else {
                        revenueByDate.set(dateKey, {
                            date: new Date(dateKey),
                            revenue: revenueAmount,
                            currency: transaction.currencyCode,
                        });
                    }
                }

                if (!pageHasItems && transactions.length === 0) {
                    hasMore = false;
                    break;
                }

                const next = await transactionCollection.next();
                if (next) {
                    transactionCollection = next;
                } else {
                    hasMore = false;
                }
            }

            // Fetch subscriptions for MRR
            let mrr = 0;
            let subCollection: any = await paddle.subscriptions.list({
                perPage: 100,
                status: ['active'],
            });

            let subHasMore = true;

            while (subHasMore) {
                const collection = subCollection;
                const subs = collection.data || [];
                let pageHasItems = false;

                for (const sub of subs) {
                    pageHasItems = true;
                    if (sub.recurringTransactionDetails) {
                        const details = sub.recurringTransactionDetails as any;
                        const amount = parseFloat(details.totals?.total || '0');
                        const interval = sub.billingCycle.interval;

                        if (interval === 'month') {
                            mrr += amount;
                        } else if (interval === 'year') {
                            mrr += amount / 12;
                        }
                    }
                }

                if (!pageHasItems && subs.length === 0) {
                    subHasMore = false;
                    break;
                }

                const next = await subCollection.next();
                if (next) {
                    subCollection = next;
                } else {
                    subHasMore = false;
                }
            }

            // Add MRR to the most recent date
            const dates = Array.from(revenueByDate.keys()).sort();
            if (dates.length > 0) {
                const latestDate = dates[dates.length - 1];
                const latestData = revenueByDate.get(latestDate)!;
                latestData.mrr = mrr;
            } else if (mrr > 0) {
                const today = new Date().toISOString().split('T')[0];
                revenueByDate.set(today, {
                    date: new Date(today),
                    revenue: 0,
                    mrr: mrr,
                    currency: 'USD' // Default
                });
            }

            return Array.from(revenueByDate.values()).sort((a, b) =>
                a.date.getTime() - b.date.getTime()
            );
        } catch (error: any) {
            logger.error('Failed to fetch Paddle revenue:', error.message);
            throw new Error(`Paddle API error: ${error.message}`);
        }
    }

    async fetchCustomerCount(): Promise<number> {
        // Simplified count
        return 0;
    }
}
