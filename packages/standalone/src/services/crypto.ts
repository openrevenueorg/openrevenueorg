/**
 * Cryptographic signing service using TweetNaCl
 */

import nacl from 'tweetnacl';
import { config } from '../config';
import { DATA_SIGNATURE_VERSION } from '@openrevenue/shared';
import type { DataSignature } from '@openrevenue/shared';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

let keyPair: nacl.SignKeyPair | null = null;

/**
 * Initialize or load key pair
 */
export function initializeKeys(): void {
  const keyPath = join(process.cwd(), 'data', 'signing-key.json');

  if (config.signingPrivateKey) {
    // Use key from environment
    const secretKey = Buffer.from(config.signingPrivateKey, 'base64');
    keyPair = nacl.sign.keyPair.fromSecretKey(secretKey);
    return;
  }

  if (existsSync(keyPath)) {
    // Load existing key
    const keyData = JSON.parse(readFileSync(keyPath, 'utf-8'));
    keyPair = {
      publicKey: Buffer.from(keyData.publicKey, 'base64'),
      secretKey: Buffer.from(keyData.secretKey, 'base64'),
    };
  } else {
    // Generate new key pair
    keyPair = nacl.sign.keyPair();

    // Save to file
    const keyData = {
      publicKey: Buffer.from(keyPair.publicKey).toString('base64'),
      secretKey: Buffer.from(keyPair.secretKey).toString('base64'),
      createdAt: new Date().toISOString(),
    };

    writeFileSync(keyPath, JSON.stringify(keyData, null, 2));
    console.log('Generated new signing key pair');
  }
}

/**
 * Get public key for verification
 */
export function getPublicKey(): string {
  if (!keyPair) {
    initializeKeys();
  }
  return Buffer.from(keyPair!.publicKey).toString('base64');
}

/**
 * Sign data with private key
 */
export function signData(data: any): DataSignature {
  if (!keyPair) {
    initializeKeys();
  }

  const dataString = JSON.stringify(data);
  const dataBytes = Buffer.from(dataString, 'utf-8');

  // Sign the data
  const signedMessage = nacl.sign(dataBytes, keyPair!.secretKey);

  // Extract just the signature (first 64 bytes)
  const signature = signedMessage.slice(0, nacl.sign.signatureLength);

  return {
    data: dataString,
    signature: Buffer.from(signature).toString('base64'),
    publicKey: getPublicKey(),
    timestamp: Date.now(),
    version: DATA_SIGNATURE_VERSION,
  };
}

/**
 * Verify a signature (for testing)
 */
export function verifySignature(signedData: DataSignature): boolean {
  try {
    const publicKey = Buffer.from(signedData.publicKey, 'base64');
    const signature = Buffer.from(signedData.signature, 'base64');
    const data = Buffer.from(signedData.data, 'utf-8');

    // Reconstruct signed message
    const signedMessage = new Uint8Array(
      signature.length + data.length
    );
    signedMessage.set(signature, 0);
    signedMessage.set(data, signature.length);

    // Verify signature
    const verified = nacl.sign.open(signedMessage, publicKey);

    return verified !== null;
  } catch (error) {
    return false;
  }
}

// Initialize keys on module load
initializeKeys();
