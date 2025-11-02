#!/usr/bin/env node
/**
 * Generate signing key for the standalone app
 */

const nacl = require('tweetnacl');
const fs = require('fs');
const path = require('path');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const keyPath = path.join(dataDir, 'signing-key.json');

// Check if key already exists
if (fs.existsSync(keyPath)) {
  console.log('Signing key already exists at:', keyPath);
  const existingKey = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
  console.log('Public key:', existingKey.publicKey);
  console.log('Created at:', existingKey.createdAt);
  process.exit(0);
}

// Generate new key pair
console.log('Generating new signing key pair...');
const keyPair = nacl.sign.keyPair();

// Save to file
const keyData = {
  publicKey: Buffer.from(keyPair.publicKey).toString('base64'),
  secretKey: Buffer.from(keyPair.secretKey).toString('base64'),
  createdAt: new Date().toISOString(),
};

fs.writeFileSync(keyPath, JSON.stringify(keyData, null, 2));

console.log('✓ Signing key generated successfully!');
console.log('  Location:', keyPath);
console.log('  Public key:', keyData.publicKey);
console.log('\nIMPORTANT: Keep the signing-key.json file secure and backed up.');
console.log('This key is used to cryptographically sign your revenue data.');
