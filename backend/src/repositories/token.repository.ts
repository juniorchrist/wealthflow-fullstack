import { prisma } from '../lib/prisma';
import { RefreshToken } from '@prisma/client';

/**
 * Sauvegarder un refresh token
 */
export const saveRefreshToken = async (
  userId: string,
  token: string,
  expiresAt: Date
): Promise<RefreshToken> => {
  return prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
};

/**
 * Trouver un refresh token
 */
export const findRefreshToken = async (token: string): Promise<RefreshToken | null> => {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: {
      user: true,
    },
  });
};

/**
 * Supprimer un refresh token spécifique
 */
export const deleteRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.delete({
    where: { token },
  }).catch(() => {
    // Ignore si le token n'existe pas
  });
};

/**
 * Supprimer tous les refresh tokens d'un utilisateur
 */
export const deleteUserTokens = async (userId: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};

/**
 * Nettoyer les tokens expirés (cron job)
 */
export const cleanupExpiredTokens = async (): Promise<number> => {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
};
