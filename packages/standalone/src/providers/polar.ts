/**
 * Polar.sh payment provider implementation
 */

import { Polar } from '@polar-sh/sdk';
import type { PaymentProvider, FetchRevenueOptions, RevenueData } from '../types/provider';
import { logger } from '../utils/logger';

export class PolarProvider implements PaymentProvider {
    name = 'polar';

    async validateCredentials(credentials: Record<string, string>): Promise<boolean> {
        try {
            const polar = new Polar({
                accessToken: credentials.apiKey,
            });

            // Test API key by fetching orders (lightweight check)
            await polar.orders.list({ limit: 1 });
            return true;
        } catch (error: any) {
            logger.error('Polar credential validation failed:', error.message);
            return false;
        }
    }

    async fetchRevenue(options: FetchRevenueOptions): Promise<RevenueData[]> {
        const { startDate, endDate, credentials } = options;

        const polar = new Polar({
            accessToken: credentials.apiKey,
        });

        const revenueByDate = new Map<string, RevenueData>();

        try {
            // Fetch orders
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const response = await polar.orders.list({
                    page,
                    limit: 100,
                    sorting: ['-created_at'], // Newest first
                });

                const orders = response.result.items;

                if (orders.length === 0) {
                    hasMore = false;
                    break;
                }

                for (const orderItem of orders) {
                    const order = orderItem as any; // Cast to any to avoid TS errors with SDK types
                    const date = new Date(order.createdAt || order.created_at);

                    // Stop if we went past the start date (since we sort by newest)
                    if (date < startDate) {
                        hasMore = false;
                        break;
                    }

                    if (date > endDate) continue;

                    const dateKey = date.toISOString().split('T')[0];
                    const amount = (order.amount || order.total_amount || 0) / 100; // Polar amounts are in cents

                    const existing = revenueByDate.get(dateKey);
                    if (existing) {
                        existing.revenue += amount;
                    } else {
                        revenueByDate.set(dateKey, {
                            date: new Date(dateKey),
                            revenue: amount,
                            currency: 'USD', // Polar defaults to USD for now usually
                        });
                    }
                }

                if (response.result.pagination.maxPage <= page) {
                    hasMore = false;
                } else {
                    page++;
                }
            }

            // Fetch subscriptions for MRR
            const subscriptions = await polar.subscriptions.list({
                active: true,
                limit: 100,
            });

            let totalMRR = 0;
            for (const subItem of subscriptions.result.items) {
                const sub = subItem as any;
                if (sub.status === 'active') {
                    const amount = (sub.amount || sub.price_amount || 0) / 100;
                    if (sub.recurringInterval === 'month' || sub.recurring_interval === 'month') {
                        totalMRR += amount;
                    } else if (sub.recurringInterval === 'year' || sub.recurring_interval === 'year') {
                        totalMRR += amount / 12;
                    }
                }
            }

            // Add MRR to the most recent date
            const dates = Array.from(revenueByDate.keys()).sort();
            if (dates.length > 0) {
                const latestDate = dates[dates.length - 1];
                const latestData = revenueByDate.get(latestDate)!;
                latestData.mrr = totalMRR;
            } else if (totalMRR > 0) {
                // If no revenue in range but has MRR, add a data point for today
                const today = new Date().toISOString().split('T')[0];
                revenueByDate.set(today, {
                    date: new Date(today),
                    revenue: 0,
                    mrr: totalMRR,
                    currency: 'USD'
                });
            }

            return Array.from(revenueByDate.values()).sort((a, b) =>
                a.date.getTime() - b.date.getTime()
            );
        } catch (error: any) {
            logger.error('Failed to fetch Polar revenue:', error.message);
            throw new Error(`Polar API error: ${error.message}`);
        }
    }

    async fetchCustomerCount(): Promise<number> {
        // Not fully implemented in this snippet as it requires iterating all subscriptions/customers
        return 0;
    }
}
