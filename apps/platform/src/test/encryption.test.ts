/**
 * Unit tests for encryption utilities
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

// Unmock the encryption module for these tests since setup.ts mocks it globally
vi.unmock('@/lib/encryption');

import { encryptApiKey, decryptApiKey } from '@/lib/encryption';

describe('Encryption', () => {
  const originalKey = process.env.ENCRYPTION_KEY;
  
  beforeAll(() => {
    // Set a test encryption key
    process.env.ENCRYPTION_KEY = 'test-key-32-characters-long!!!!';
  });

  afterAll(() => {
    // Restore original key
    process.env.ENCRYPTION_KEY = originalKey || '';
  });

  describe('encryptApiKey', () => {
    it('should encrypt API keys', () => {
      const plaintext = 'sk_test_12345';
      const encrypted = encryptApiKey(plaintext);
      
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should produce different ciphertexts for same plaintext', () => {
      const plaintext = 'sk_test_12345';
      const encrypted1 = encryptApiKey(plaintext);
      const encrypted2 = encryptApiKey(plaintext);
      
      // Due to random IVs, ciphertexts should be different
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('decryptApiKey', () => {
    it('should decrypt encrypted API keys', () => {
      const plaintext = 'sk_test_12345';
      const encrypted = encryptApiKey(plaintext);
      const decrypted = decryptApiKey(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle round-trip encryption/decryption', () => {
      const testKeys = [
        'sk_test_12345',
        'pk_live_abcdefghijklmnopqrstuvwxyz',
        'secret_key_with_special_chars!@#$%^&*()',
      ];

      for (const key of testKeys) {
        const encrypted = encryptApiKey(key);
        const decrypted = decryptApiKey(encrypted);
        expect(decrypted).toBe(key);
      }
    });

    it('should throw error for invalid ciphertext', () => {
      expect(() => {
        decryptApiKey('invalid_base64_ciphertext');
      }).toThrow();
    });
  });

  describe('error handling', () => {
    it('should throw if ENCRYPTION_KEY is not set', () => {
      const originalEnv = process.env.ENCRYPTION_KEY;
      delete process.env.ENCRYPTION_KEY;

      expect(() => {
        encryptApiKey('test');
      }).toThrow();

      process.env.ENCRYPTION_KEY = originalEnv || '';
    });
  });
});

