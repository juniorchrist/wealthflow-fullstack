import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from './errorHandler';

/**
 * Middleware pour vérifier l'authentification
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Token d\'authentification manquant', 'NO_TOKEN');
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier le token
    const payload = verifyAccessToken(token);

    // Attacher l'utilisateur à la requête
    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, 'Token invalide ou expiré', 'INVALID_TOKEN'));
    }
  }
};

/**
 * Middleware optionnel pour récupérer l'utilisateur si le token est présent
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      req.user = {
        userId: payload.userId,
        email: payload.email,
      };
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur
    next();
  }
};
