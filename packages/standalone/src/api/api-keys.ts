/**
 * API key management endpoints
 */

import { Router, type Router as ExpressRouter } from 'express';
import { createApiKey, listApiKeys, revokeApiKey } from '../services/api-keys';

export const apiKeysRouter: ExpressRouter = Router();

/**
 * POST /api-keys
 * Create a new API key
 * Note: This should be protected by admin authentication in production
 */
apiKeysRouter.post('/', async (req, res, next) => {
  try {
    const { name, expiresIn } = req.body;
    const apiKey = await createApiKey(name, expiresIn);
    res.json({ apiKey });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api-keys
 * List all API keys
 */
apiKeysRouter.get('/', async (req, res, next) => {
  try {
    const keys = await listApiKeys();
    res.json({ keys });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api-keys/:id
 * Revoke an API key
 */
apiKeysRouter.delete('/:id', async (req, res, next) => {
  try {
    await revokeApiKey(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
