import { Request, Response, NextFunction } from 'express';
import {
  register,
  login,
  refreshTokens,
  logout,
  getCurrentUser,
} from '../services/auth.service';
import { RegisterInput, LoginInput, RefreshInput, LogoutInput } from '../validators/auth.validator';
import { logger, sanitizeForLog } from '../utils/logger';

/**
 * Controller pour l'inscription
 * POST /api/auth/register
 */
export const registerHandler = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await register(req.body);

    logger.info('Registration successful', sanitizeForLog({ email: req.body.email }));

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller pour la connexion
 * POST /api/auth/login
 */
export const loginHandler = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await login(req.body);

    logger.info('Login successful', sanitizeForLog({ email: req.body.email }));

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller pour le renouvellement des tokens
 * POST /api/auth/refresh
 */
export const refreshHandler = async (
  req: Request<{}, {}, RefreshInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokens = await refreshTokens(req.body);

    res.status(200).json({
      success: true,
      message: 'Tokens renouvelés',
      data: { tokens },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller pour la déconnexion
 * POST /api/auth/logout
 */
export const logoutHandler = async (
  req: Request<{}, {}, LogoutInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    await logout(req.body.refreshToken);

    logger.info('Logout successful', { userId: req.user?.userId });

    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller pour obtenir l'utilisateur courant
 * GET /api/auth/me
 */
export const getMeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
      return;
    }

    const user = await getCurrentUser(req.user.userId);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
