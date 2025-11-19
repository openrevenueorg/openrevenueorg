/**
 * Polar.sh payment provider integration
 */

import { Polar } from '@polar-sh/sdk';
import {
    PaymentProvider,
    type PaymentProviderConfig,
    type FetchRevenueOptions,
    type ValidationResult,
} from './base';
import type { RevenueMetrics, RevenueDataPoint } from '@openrevenueorg/shared';

export class PolarProvider extends PaymentProvider {
    private polar: Polar;

    constructor(config: PaymentProviderConfig) {
        super(config, 'polar');
        this.polar = new Polar({
            accessToken: config.apiKey,
        });
    }

    async validateCredentials(): Promise<ValidationResult> {
        try {
            await this.polar.users.getAuthenticated();
            return { valid: true };
        } catch (error: any) {
            return {
                valid: false,
                error: error.message || 'Invalid Polar API key',
            };
        }
    }

    async fetchRevenue(options: FetchRevenueOptions): Promise<RevenueDataPoint[]> {
        const { startDate, endDate, interval = 'monthly', currency = 'USD' } = options;

        try {
            const revenueByDate = new Map<string, number>();
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const response = await this.polar.orders.list({
                    page,
                    limit: 100,
                    sorting: ['-created_at'],
                });

                const orders = response.result.items;

                if (orders.length === 0) {
                    hasMore = false;
                    break;
                }

                for (const order of orders) {
                    const date = new Date(order.createdAt);

                    if (date < startDate) {
                        hasMore = false;
                        break;
                    }

                    if (date > endDate) continue;

                    const dateKey =
                        interval === 'daily'
                            ? date.toISOString().split('T')[0]
                            : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

                    const amount = order.amount / 100;
                    revenueByDate.set(dateKey, (revenueByDate.get(dateKey) || 0) + amount);
                }

                if (response.result.pagination.maxPage <= page) {
                    hasMore = false;
                } else {
                    page++;
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
            throw new Error(`Failed to fetch Polar revenue: ${error.message}`);
        }
    }

    async fetchCurrentMetrics(): Promise<RevenueMetrics> {
        try {
            const subscriptions = await this.polar.subscriptions.list({
                active: true,
                limit: 100,
            });

            let mrr = 0;
            const uniqueCustomers = new Set<string>();

            for (const sub of subscriptions.result.items) {
                if (sub.status === 'active') {
                    const amount = (sub.amount || 0) / 100;
                    if (sub.recurringInterval === 'month') {
                        mrr += amount;
                    } else if (sub.recurringInterval === 'year') {
                        mrr += amount / 12;
                    }

                    if (sub.userId) {
                        uniqueCustomers.add(sub.userId);
                    }
                }
            }

            // Calculate total revenue (simplified, e.g. last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Reuse fetchRevenue for total revenue
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
            throw new Error(`Failed to fetch Polar metrics: ${error.message}`);
        }
    }

    async fetchCustomerCount(): Promise<number> {
        try {
            // Polar doesn't have a direct "count customers" endpoint easily accessible without iterating
            // For now, we can list subscriptions and count unique users as a proxy
            const subscriptions = await this.polar.subscriptions.list({
                active: true,
                limit: 100,
            });

            const uniqueCustomers = new Set<string>();
            for (const sub of subscriptions.result.items) {
                if (sub.userId) uniqueCustomers.add(sub.userId);
            }

            return uniqueCustomers.size;
        } catch (error: any) {
            throw new Error(`Failed to fetch customer count: ${error.message}`);
        }
    }

    verifyWebhook(payload: any, signature: string): boolean {
        // TODO: Implement webhook verification using Polar SDK utilities if available
        return true;
    }
}
