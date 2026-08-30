import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error cleanly without exposing secrets
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  if (err instanceof ZodError) {
    const errorDetails = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({
      error: 'Données de formulaire invalides.',
      details: errorDetails,
    });
    return;
  }

  if (err.code === 'P2002') {
    // Prisma unique constraint error
    res.status(409).json({
      error: 'Un enregistrement avec cette valeur unique existe déjà.',
    });
    return;
  }

  if (err.code === 'P2025') {
    // Prisma record not found
    res.status(404).json({
      error: 'Ressource introuvable.',
    });
    return;
  }

  const statusCode = err.status || err.statusCode || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Une erreur interne est survenue sur le serveur.'
      : err.message || 'Une erreur inattendue est survenue.';

  res.status(statusCode).json({ error: message });
}
