/**
 * Unit tests for revenue calculation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  calculateMRR,
  calculateARR,
  calculateGrowthRate,
  formatCurrency,
} from '@/lib/revenue';

describe('Revenue Calculations', () => {
  describe('calculateMRR', () => {
    it('should calculate MRR from revenue data', () => {
      const revenueData = [
        { date: new Date('2024-01-01'), revenue: 1000, mrr: 1000 },
        { date: new Date('2024-02-01'), revenue: 1200, mrr: 1200 },
      ];
      
      const mrr = calculateMRR(revenueData);
      expect(mrr).toBe(1200); // Most recent MRR
    });

    it('should return 0 for no MRR data', () => {
      const revenueData = [
        { date: new Date('2024-01-01'), revenue: 1000 },
      ];
      
      const mrr = calculateMRR(revenueData);
      expect(mrr).toBe(0);
    });

    it('should handle empty data', () => {
      const mrr = calculateMRR([]);
      expect(mrr).toBe(0);
    });
  });

  describe('calculateARR', () => {
    it('should calculate ARR from MRR', () => {
      const arr = calculateARR(1000);
      expect(arr).toBe(12000);
    });

    it('should handle zero MRR', () => {
      const arr = calculateARR(0);
      expect(arr).toBe(0);
    });
  });

  describe('calculateGrowthRate', () => {
    it('should calculate positive growth rate', () => {
      const growth = calculateGrowthRate(1000, 800);
      expect(growth).toBe(25);
    });

    it('should calculate negative growth rate', () => {
      const growth = calculateGrowthRate(800, 1000);
      expect(growth).toBe(-20);
    });

    it('should handle zero previous value', () => {
      const growth = calculateGrowthRate(100, 0);
      expect(growth).toBe(100);
    });
  });

  describe('formatCurrency', () => {
    it('should format USD correctly', () => {
      const formatted = formatCurrency(1234.56, 'USD');
      expect(formatted).toMatch(/^\$1,234\.56$/);
    });

    it('should format large amounts with k suffix', () => {
      const formatted = formatCurrency(15000);
      expect(formatted).toMatch(/^\$15k?$/);
    });

    it('should format zero correctly', () => {
      const formatted = formatCurrency(0);
      expect(formatted).toBe('$0.00');
    });
  });
});

