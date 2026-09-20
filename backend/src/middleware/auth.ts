import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from './errorHandler';
import { prisma } from '../lib/prisma';

/**
 * Middleware pour vérifier l'authentification et l'existence réelle en base
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Token d\'authentification manquant', 'NO_TOKEN');
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier la signature et validité temporelle du token
    const payload = verifyAccessToken(token);

    // Vérifier impérativement l'existence réelle du compte en base de données
    // (empêche un utilisateur supprimé par l'admin d'utiliser un ancien token valide)
    let user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true },
    });

    // Si l'utilisateur n'est pas trouvé par ID mais que le token est un token administrateur,
    // retrouver le compte administrateur par email ou le régénérer automatiquement
    if (!user && (payload.role === 'admin' || payload.email === 'admin@wealthflow.app')) {
      const adminEmail = payload.email || 'admin@wealthflow.app';
      user = await prisma.user.findUnique({
        where: { email: adminEmail.toLowerCase().trim() },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        const { hashPassword } = await import('../utils/hash');
        const defaultHash = await hashPassword(process.env.ADMIN_PASSWORD || 'wealthflow2026');
        user = await prisma.user.create({
          data: {
            email: 'admin@wealthflow.app',
            passwordHash: defaultHash,
            nom: 'WealthFlow',
            prenom: 'Admin',
            role: 'admin',
            plan: 'WealthFlow Master Admin',
          },
          select: { id: true, email: true, role: true },
        });
      }
    }

    if (!user) {
      throw new AppError(401, 'Compte utilisateur introuvable ou supprimé', 'ACCOUNT_NOT_FOUND');
    }

    // Attacher l'utilisateur vérifié à la requête
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role || 'user',
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
 * Middleware pour vérifier que l'utilisateur est administrateur
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentification requise', 'UNAUTHORIZED');
    }

    if (req.user.role !== 'admin') {
      throw new AppError(403, 'Accès refusé. Privilèges administrateur requis.', 'FORBIDDEN_ADMIN_ONLY');
    }

    next();
  } catch (error) {
    next(error);
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
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true },
      });
      if (user) {
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role || 'user',
        };
      }
    }

    next();
  } catch (error) {
    next();
  }
};

