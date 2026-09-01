import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/auth';
import { prisma } from '../config/prisma';

export interface AuthenticatedRequest extends Request<any, any, any, any> {
  user?: {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    numero: string;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Accès non autorisé. Token manquant ou invalide.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded: JwtPayload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        numero: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Utilisateur introuvable ou session expirée.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Session expirée ou token invalide. Veuillez vous reconnecter.' });
  }
}
