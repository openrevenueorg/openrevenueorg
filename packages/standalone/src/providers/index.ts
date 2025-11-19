/**
 * Provider factory
 */

import type { PaymentProvider, ProviderType } from '../types/provider';
import { StripeProvider } from './stripe';
import { PolarProvider } from './polar';
import { PaddleProvider } from './paddle';

export function getProvider(type: ProviderType): PaymentProvider {
  switch (type) {
    case 'stripe':
      return new StripeProvider();
    case 'polar':
      return new PolarProvider();
    case 'paddle':
      return new PaddleProvider();
    default:
      throw new Error(`Unsupported provider: ${type}`);
  }
}

export * from './stripe';
export * from './polar';
export * from './paddle';
