/**
 * Data verification utilities for standalone app integration
 */

import { createHash, createVerify } from 'crypto';

export function generateDataHash(data: any): string {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(data));
  return hash.digest('hex');
}

export function verifySignature(
  data: any,
  signature: string,
  publicKey: string
): boolean {
  try {
    const verify = createVerify('SHA256');
    verify.update(JSON.stringify(data));
    verify.end();

    return verify.verify(publicKey, signature, 'base64');
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export function isDataStale(timestamp: Date, maxAgeHours: number = 24): boolean {
  const now = new Date();
  const ageInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
  return ageInHours > maxAgeHours;
}
