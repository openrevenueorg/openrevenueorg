/**
 * Payment provider factory
 */

import { PaymentProvider, type PaymentProviderConfig } from './base';
import { StripeProvider } from './stripe';
import { PaddleProvider } from './paddle';
import { LemonSqueezyProvider } from './lemonsqueezy';
import { PayPalProvider } from './paypal';
import { PolarProvider } from './polar';
import type { PaymentProvider as PaymentProviderType } from '@openrevenueorg/shared';

export { PaymentProvider, type PaymentProviderConfig };

export function createProvider(
  provider: PaymentProviderType,
  config: PaymentProviderConfig
): PaymentProvider {
  switch (provider) {
    case 'stripe':
      return new StripeProvider(config);

    case 'paddle':
      return new PaddleProvider(config);

    case 'lemon_squeezy':
      return new LemonSqueezyProvider(config);

    case 'paypal':
      return new PayPalProvider(config);

    case 'polar':
      return new PolarProvider(config);

    default:
      throw new Error(`Unsupported payment provider: ${provider}`);
  }
}
