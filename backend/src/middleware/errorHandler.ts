import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger, sanitizeForLog } from '../utils/logger';
import { ApiError } from '../types/api.types';
import { env } from '../config/env';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log l'erreur (sans données sensibles)
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: sanitizeForLog(req.body),
  });

  // Erreur de validation Zod
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.errors.forEach((error) => {
      const path = error.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(error.message);
    });

    const response: ApiError = {
      success: false,
      message: 'Erreur de validation',
      code: 'VALIDATION_ERROR',
      errors,
    };

    return res.status(400).json(response);
  }

  // Erreur personnalisée (AppError)
  if (err instanceof AppError) {
    const response: ApiError = {
      success: false,
      message: err.message,
      code: err.code,
      errors: err.errors,
    };

    return res.status(err.statusCode).json(response);
  }

  // Erreur Prisma
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Une ressource avec ces données existe déjà',
        code: 'DUPLICATE_ERROR',
      });
    }

    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Ressource non trouvée',
        code: 'NOT_FOUND',
      });
    }
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré',
      code: 'INVALID_TOKEN',
    });
  }

  // Erreur inconnue
  const response: ApiError & { errorDetails?: string } = {
    success: false,
    message: err.message || 'Une erreur interne est survenue',
    code: 'INTERNAL_ERROR',
    errorDetails: err.message,
  };

  return res.status(500).json(response);
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} non trouvée`,
    code: 'ROUTE_NOT_FOUND',
  });
};
