/**
 * Test setup and configuration
 */

import { vi } from 'vitest';

// Mock Next.js headers
global.Headers = Headers;

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Better Auth
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    startup: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    dataConnection: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    revenueSnapshot: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    story: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    milestone: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    privacySettings: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    leaderboardEntry: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    syncLog: {
      create: vi.fn(),
    },
  },
}));

// Mock Redis
vi.mock('@/lib/redis', () => ({
  getRedis: vi.fn(),
  closeRedis: vi.fn(),
}));

// Mock encryption
vi.mock('@/lib/encryption', () => ({
  encryptApiKey: vi.fn((key: string) => `encrypted_${key}`),
  decryptApiKey: vi.fn((key: string) => key.replace('encrypted_', '')),
}));

