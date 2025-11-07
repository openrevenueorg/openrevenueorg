/**
 * Build script for standalone app UI
 * Copies static files to dist directory
 */

import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const publicDir = join(__dirname, '..', 'public');
const distDir = join(__dirname, '..', 'dist', 'public');

// Create dist/public directory
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Copy index.html
copyFileSync(
  join(publicDir, 'index.html'),
  join(distDir, 'index.html')
);

console.log('UI files copied to dist/public');
