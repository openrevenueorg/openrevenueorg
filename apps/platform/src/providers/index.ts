/**
 * Payment provider factory
 */

import { PaymentProvider, type PaymentProviderConfig } from './base';
import { StripeProvider } from './stripe';
import type { PaymentProvider as PaymentProviderType } from '@openrevenue/shared';

export { PaymentProvider, type PaymentProviderConfig };

export function createProvider(
  provider: PaymentProviderType,
  config: PaymentProviderConfig
): PaymentProvider {
  switch (provider) {
    case 'stripe':
      return new StripeProvider(config);

    case 'paddle':
      throw new Error('Paddle provider not yet implemented');

    case 'lemon_squeezy':
      throw new Error('Lemon Squeezy provider not yet implemented');

    case 'paypal':
      throw new Error('PayPal provider not yet implemented');

    default:
      throw new Error(`Unsupported payment provider: ${provider}`);
  }
}
