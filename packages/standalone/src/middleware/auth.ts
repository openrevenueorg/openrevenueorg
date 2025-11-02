/**
 * Authentication middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from './error-handler';
import { ERROR_CODES } from '@openrevenue/shared';

export interface AuthRequest extends Request {
  apiKey?: string;
  userId?: string;
  authType?: 'session' | 'apikey';
}

/**
 * Verify authentication (supports both session and API key)
 * Use this for endpoints that should be accessible from both the web UI and external apps
 */
export function verifyAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // Check for session authentication first (from web UI)
  const sessionUserId = (req.session as any)?.userId;
  if (sessionUserId) {
    req.userId = sessionUserId;
    req.authType = 'session';
    return next();
  }

  // Check for API key authentication (from external apps)
  const apiKey = req.headers['x-api-key'] as string;
  if (apiKey) {
    try {
      const decoded = jwt.verify(apiKey, config.jwtSecret) as { id: string };
      req.apiKey = apiKey;
      req.userId = decoded.id;
      req.authType = 'apikey';

      return next();
    } catch (error) {
      throw new AppError(
        ERROR_CODES.INVALID_TOKEN,
        401,
        'Invalid API key'
      );
    }
  }

  // No valid authentication found
  throw new AppError(
    ERROR_CODES.UNAUTHORIZED,
    401,
    'Authentication required. Please provide a valid session or API key.'
  );
}

/**
 * Verify API key from header (strict - only accepts API keys)
 * Use this for endpoints that should ONLY be accessible via API key (e.g., platform integration)
 */
export function verifyApiKey(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    throw new AppError(
      ERROR_CODES.UNAUTHORIZED,
      401,
      'API key required'
    );
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(apiKey, config.jwtSecret) as { id: string };
    req.apiKey = apiKey;
    req.userId = decoded.id;
    req.authType = 'apikey';
    next();
  } catch (error) {
    throw new AppError(
      ERROR_CODES.INVALID_TOKEN,
      401,
      'Invalid API key'
    );
  }
}

/**
 * Optional authentication (doesn't fail if no key provided)
 */
export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers['x-api-key'] as string;

  if (apiKey) {
    try {
      const decoded = jwt.verify(apiKey, config.jwtSecret) as { id: string };
      req.apiKey = apiKey;
      req.userId = decoded.id;
    } catch (error) {
      // Invalid key, but continue anyway
    }
  }

  next();
}
