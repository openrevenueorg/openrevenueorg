/**
 * Data verification utilities for standalone app integration
 */

import nacl from 'tweetnacl';
import { createHash } from 'crypto';

/**
 * Verify Ed25519 signature from standalone app
 */
export function verifySignature(
  dataString: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const dataBytes = Buffer.from(dataString, 'utf-8');
    const signatureBytes = Buffer.from(signature, 'base64');
    const publicKeyBytes = Buffer.from(publicKey, 'base64');
    
    // Verify Ed25519 signature using NaCl
    return nacl.sign.detached.verify(
      dataBytes,
      signatureBytes,
      publicKeyBytes
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export function generateDataHash(data: any): string {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(data));
  return hash.digest('hex');
}

export function isDataStale(timestamp: number, maxAgeMinutes: number = 10): boolean {
  const ageInMs = Date.now() - timestamp;
  return ageInMs > maxAgeMinutes * 60 * 1000;
}
