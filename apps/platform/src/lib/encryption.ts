/**
 * Encryption utilities for API keys and secrets
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  // Ensure key is 32 bytes for AES-256
  return Buffer.from(key.padEnd(32, '0').slice(0, 32));
}

export function encryptApiKey(text: string): string {
  const iv = randomBytes(IV_LENGTH);
  const salt = randomBytes(SALT_LENGTH);
  const key = getKey();

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(String(text), 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

export function decryptApiKey(encryptedText: string): string {
  const buffer = Buffer.from(encryptedText, 'base64');

  const salt = buffer.subarray(0, SALT_LENGTH);
  const iv = buffer.subarray(SALT_LENGTH, TAG_POSITION);
  const tag = buffer.subarray(TAG_POSITION, ENCRYPTED_POSITION);
  const encrypted = buffer.subarray(ENCRYPTED_POSITION);

  const key = getKey();

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return decipher.update(encrypted) + decipher.final('utf8');
}
