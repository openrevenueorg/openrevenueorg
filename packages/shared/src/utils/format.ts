/**
 * Formatting utilities for revenue and currency
 */
import type { Currency, PrivacyLevel } from '../types/common';

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'A$',
};

export function formatCurrency(
  amount: number,
  currency: Currency = 'USD',
  options: { compact?: boolean; decimals?: number } = {}
): string {
  const { compact = false, decimals = 2 } = options;
  const symbol = currencySymbols[currency] || currency;

  if (compact) {
    if (amount >= 1000000) {
      return `${symbol}${(amount / 1000000)?.toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${symbol}${(amount / 1000)?.toFixed(1)}K`;
    }
  }

  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatRevenueWithPrivacy(
  amount: number,
  currency: Currency,
  privacyLevel: PrivacyLevel
): string {

  // Return range like $10K-$25K
  const roundTo = amount >= 100000 ? 50000 : amount >= 10000 ? 5000 : 1000;
  const lower = Math.floor(amount / roundTo) * roundTo;
  const upper = lower + roundTo;

  switch (privacyLevel) {
    case 'public':
      return formatCurrency(amount, currency);

    case 'range':
      return `${formatCurrency(lower, currency, { compact: true })}-${formatCurrency(upper, currency, { compact: true })}`;

    case 'hidden':
      return 'Hidden';

    default:
      return 'N/A';
  }
}

export function formatGrowthRate(rate: number): string {
  const sign = rate >= 0 ? '+' : '';
  return `${sign}${rate?.toFixed(1)}%`;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value?.toFixed(decimals)}%`;
}

export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'short') {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;

  return formatDate(d, 'short');
}
