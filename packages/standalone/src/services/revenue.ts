/**
 * Revenue data service
 */

import { getRevenueDataByDateRange } from '../database';
import type { RevenueDataPoint, RevenueMetrics } from '@openrevenueorg/shared';

export interface GetRevenueDataOptions {
  startDate: Date;
  endDate: Date;
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export async function getRevenueData(
  options: GetRevenueDataOptions
): Promise<RevenueDataPoint[]> {
  const { startDate, endDate, interval } = options;

  const rows = await getRevenueDataByDateRange(startDate, endDate);

  // Group by interval if needed
  if (interval === 'monthly') {
    const monthlyData = new Map<string, RevenueDataPoint>();

    for (const row of rows) {
      const date = new Date(row.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

      const existing = monthlyData.get(monthKey);
      if (existing) {
        existing.revenue += row.revenue;
        if (row.mrr) existing.mrr = (existing.mrr || 0) + row.mrr;
        if (row.customer_count) {
          existing.customerCount = Math.max(
            existing.customerCount || 0,
            row.customer_count
          );
        }
      } else {
        monthlyData.set(monthKey, {
          date: new Date(monthKey).toISOString(),
          revenue: row.revenue,
          mrr: row.mrr,
          customerCount: row.customer_count,
          currency: row.currency,
        });
      }
    }

    return Array.from(monthlyData.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }

  // Return daily data
  return rows.map((row) => ({
    date: new Date(row.date).toISOString(),
    revenue: row.revenue,
    mrr: row.mrr,
    customerCount: row.customer_count,
    currency: row.currency,
  }));
}

export async function getCurrentMetrics(): Promise<RevenueMetrics> {
  // Get most recent data point
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const rows = await getRevenueDataByDateRange(thirtyDaysAgo, new Date());

  if (rows.length === 0) {
    return {
      mrr: 0,
      arr: 0,
      totalRevenue: 0,
      growthRate: 0,
      customerCount: 0,
      currency: 'USD',
      timestamp: new Date(),
    };
  }

  // Get latest values
  const latest = rows[rows.length - 1];
  const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);

  return {
    mrr: latest.mrr || 0,
    arr: latest.arr || (latest.mrr ? latest.mrr * 12 : 0),
    totalRevenue,
    customerCount: latest.customer_count || 0,
    growthRate: 0,
    currency: latest.currency,
    timestamp: new Date(),
  };
}
