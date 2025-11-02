/**
 * Web UI routes (placeholder)
 */

import { Router, type Router as ExpressRouter } from 'express';
import { join } from 'path';
import { config } from '../config';

export const webRouter: ExpressRouter = Router();

// Serve static files
webRouter.use('/assets', (req, res, next) => {
  // Serve from public directory
  next();
});

// Home page
webRouter.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.startupName} - Revenue Dashboard</title>
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
        <h1>${config.startupName}</h1>
        <p>${config.startupDescription}</p>
        <p><span class="status">✓ Online</span></p>
        <p>This is an OpenRevenue Standalone App instance.</p>
        <p>API endpoint: <code>/api/v1</code></p>
      </div>
    </body>
    </html>
  `);
});
