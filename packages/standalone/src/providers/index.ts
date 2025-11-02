/**
 * Provider factory
 */

import type { PaymentProvider, ProviderType } from '../types/provider';
import { StripeProvider } from './stripe';

export function getProvider(type: ProviderType): PaymentProvider {
  switch (type) {
    case 'stripe':
      return new StripeProvider();
    default:
      throw new Error(`Unsupported provider: ${type}`);
  }
}

export * from './stripe';
