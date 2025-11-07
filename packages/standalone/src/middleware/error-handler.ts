/**
 * Express error handling middleware
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ERROR_CODES } from '@openrevenueorg/shared';

export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Request error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }

  // Default error response
  res.status(500).json({
    code: ERROR_CODES.INTERNAL_ERROR,
    message: 'Internal server error',
  });
}
