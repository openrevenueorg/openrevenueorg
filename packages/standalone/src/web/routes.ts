/**
 * Web UI routes
 */

import { Router, type Router as ExpressRouter } from 'express';
import { join } from 'path';
import express from 'express';
import { existsSync } from 'fs';
import { fileURLToPath } from "url";

export const webRouter: ExpressRouter = Router();

// Serve static files from dist/public

const publicDir = join(process.cwd(), 'dist', 'public');
//const __filename = fileURLToPath(publicDir);
if (existsSync(publicDir)) {
  webRouter.use(express.static(publicDir));

  // SPA fallback - serve index.html for all non-API routes
  webRouter.get('*', (req, res) => {
    res.sendFile(join(publicDir, 'index.html'));
  });
} else {
  // Fallback for development when UI isn't built yet
  webRouter.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OpenRevenue Standalone</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 {
            color: #333;
            margin-top: 0;
          }
          p {
            color: #666;
            line-height: 1.6;
          }
          .status {
            display: inline-block;
            padding: 4px 12px;
            background: #10b981;
            color: white;
            border-radius: 4px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>OpenRevenue Standalone</h1>
          <p><span class="status">✓ Online</span></p>
          <p>The UI needs to be built. Run <code>pnpm build:ui</code> to build the React frontend.</p>
          <p>API endpoint: <code>/api/v1</code></p>
        </div>
      </body>
      </html>
    `);
  });
}
