/**
 * Rate limiting middleware
 */

import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '@openrevenueorg/shared';

export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: RATE_LIMITS.AUTHENTICATED,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const publicLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: RATE_LIMITS.PUBLIC,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
