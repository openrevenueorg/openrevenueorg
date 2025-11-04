/**
 * Revenue calculation utilities
 */

interface RevenueData {
  revenue: number;
  mrr?: number;
  arr?: number;
  customerCount?: number;
  date: Date;
}

export function calculateMRR(revenueData: RevenueData[]): number {
  if (revenueData.length === 0) return 0;

  // Get the most recent MRR value
  const sortedData = [...revenueData].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  return sortedData[0].mrr || 0;
}

export function calculateARR(mrr: number): number {
  return mrr * 12;
}

export function calculateGrowthRate(
  currentValue: number,
  previousValue: number
): number {
  if (previousValue === 0) {
    // If starting from zero, return 100% growth if current > 0
    return currentValue > 0 ? 100 : 0;
  }
  return ((currentValue - previousValue) / previousValue) * 100;
}

export function calculateChurnRate(
  customersLost: number,
  totalCustomersStart: number
): number {
  if (totalCustomersStart === 0) return 0;
  return (customersLost / totalCustomersStart) * 100;
}

export function calculateTotalRevenue(revenueData: RevenueData[]): number {
  return revenueData.reduce((sum, data) => sum + data.revenue, 0);
}

export function calculateAverageRevenuePerCustomer(
  totalRevenue: number,
  customerCount: number
): number {
  if (customerCount === 0) return 0;
  return totalRevenue / customerCount;
}

export function groupRevenueByMonth(
  revenueData: RevenueData[]
): Map<string, RevenueData[]> {
  const grouped = new Map<string, RevenueData[]>();

  revenueData.forEach((data) => {
    const monthKey = `${data.date.getFullYear()}-${String(
      data.date.getMonth() + 1
    ).padStart(2, '0')}`;

    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }
    grouped.get(monthKey)!.push(data);
  });

  return grouped;
}

export function aggregateMonthlyMetrics(revenueData: RevenueData[]): {
  month: string;
  totalRevenue: number;
  mrr: number;
  customers: number;
}[] {
  const grouped = groupRevenueByMonth(revenueData);
  const results: {
    month: string;
    totalRevenue: number;
    mrr: number;
    customers: number;
  }[] = [];

  grouped.forEach((monthData, monthKey) => {
    const totalRevenue = monthData.reduce((sum, d) => sum + d.revenue, 0);
    const avgMrr =
      monthData.reduce((sum, d) => sum + (d.mrr || 0), 0) / monthData.length;
    const avgCustomers =
      monthData.reduce((sum, d) => sum + (d.customerCount || 0), 0) /
      monthData.length;

    results.push({
      month: monthKey,
      totalRevenue,
      mrr: avgMrr,
      customers: Math.round(avgCustomers),
    });
  });

  return results.sort((a, b) => a.month.localeCompare(b.month));
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  // For large whole numbers, use compact format with 'k' suffix
  if (amount >= 1000 && Number.isInteger(amount)) {
    return `$${(amount / 1000).toFixed(0)}k`;
  }

  // For all other amounts, show with 2 decimal places
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactCurrency(amount: number, currency: string = 'USD'): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}k`;
  }
  return formatCurrency(amount, currency);
}
