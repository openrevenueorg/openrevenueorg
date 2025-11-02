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
}

/**
 * Verify API key from header
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
