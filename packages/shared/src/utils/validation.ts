/**
 * Validation utilities
 */

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidApiKey(apiKey: string, provider: string): boolean {
  // Basic validation - each provider has different formats
  switch (provider) {
    case 'stripe':
      return /^(sk|pk)_(test|live)_[a-zA-Z0-9]{24,}$/.test(apiKey);
    case 'paddle':
      return apiKey.length >= 32;
    case 'lemon_squeezy':
      return apiKey.startsWith('ls_') && apiKey.length >= 40;
    case 'paypal':
      return apiKey.length >= 32;
    default:
      return apiKey.length >= 20;
  }
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}

export function validateDateRange(startDate: Date, endDate: Date): boolean {
  return startDate <= endDate && startDate <= new Date();
}

export function isValidCurrency(currency: string): boolean {
  return ['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(currency);
}
