import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Rate limiter global
 */
export const globalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs, // 15 minutes par défaut
  max: env.rateLimit.maxRequests, // 100 requêtes par défaut
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter strict pour les routes sensibles (auth)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 tentatives
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes',
    code: 'AUTH_RATE_LIMIT',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Ne compte que les échecs
});
