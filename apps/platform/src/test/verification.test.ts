/**
 * Unit tests for data verification utilities
 */

import { describe, it, expect } from 'vitest';
import { verifySignature, generateDataHash, isDataStale } from '@/lib/verification';

describe('Data Verification', () => {
  describe('generateDataHash', () => {
    it('should generate consistent hashes for same data', () => {
      const data = { revenue: 1000, date: '2024-01-01' };
      const hash1 = generateDataHash(data);
      const hash2 = generateDataHash(data);
      
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for different data', () => {
      const data1 = { revenue: 1000 };
      const data2 = { revenue: 2000 };
      const hash1 = generateDataHash(data1);
      const hash2 = generateDataHash(data2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle null and undefined', () => {
      const hash1 = generateDataHash(null);
      const hash2 = generateDataHash(undefined);
      
      expect(hash1.length).toBeGreaterThan(0);
      expect(hash2.length).toBeGreaterThan(0);
    });
  });

  describe('isDataStale', () => {
    it('should return false for fresh data', () => {
      const now = Date.now();
      const isStale = isDataStale(now, 10);
      expect(isStale).toBe(false);
    });

    it('should return true for stale data', () => {
      const elevenMinutesAgo = Date.now() - 11 * 60 * 1000;
      const isStale = isDataStale(elevenMinutesAgo, 10);
      expect(isStale).toBe(true);
    });

    it('should respect custom maxAgeMinutes', () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      const isStaleOneHour = isDataStale(twoHoursAgo, 60);
      expect(isStaleOneHour).toBe(true);
      
      const isStaleThreeHours = isDataStale(twoHoursAgo, 180);
      expect(isStaleThreeHours).toBe(false);
    });
  });

  describe('verifySignature', () => {
    // Note: This test requires actual Ed25519 keys
    // In a real scenario, we'd generate test keys
    it('should be implemented', () => {
      expect(typeof verifySignature).toBe('function');
    });
  });
});

