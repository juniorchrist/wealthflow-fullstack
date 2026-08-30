import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';

export async function getSettings(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          theme: 'light',
          currency: 'FCFA',
          securityLockEnabled: false,
        },
      });
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { theme, currency, securityLockEnabled } = req.body;

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        theme: theme || 'light',
        currency: currency || 'FCFA',
        securityLockEnabled: securityLockEnabled ?? false,
      },
      update: {
        theme: theme !== undefined ? theme : undefined,
        currency: currency !== undefined ? currency : undefined,
        securityLockEnabled: securityLockEnabled !== undefined ? securityLockEnabled : undefined,
      },
    });

    res.json(settings);
  } catch (error) {
    next(error);
  }
}
