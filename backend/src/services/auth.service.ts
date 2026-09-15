import { User } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import {
  createUser,
  findUserByEmail,
  findUserById,
  getUserProfile,
} from '../repositories/user.repository';
import {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteUserTokens,
} from '../repositories/token.repository';
import { RegisterInput, LoginInput, RefreshInput } from '../validators/auth.validator';
import { logger } from '../utils/logger';
import { prisma } from '../lib/prisma';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash' | 'pinHash'>;
  tokens: AuthTokens;
}

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (data: RegisterInput): Promise<AuthResponse> => {
  // Vérifier si l'email fait l'objet d'un bannissement
  const banRecord = await prisma.banRecord.findUnique({
    where: { email: data.email.toLowerCase().trim() },
  });
  if (banRecord) {
    throw new AppError(
      403,
      `Cette adresse email a été suspendue pour le motif suivant : "${banRecord.reason}". Pour toute réclamation, contactez le Centre d'aide.`,
      'ACCOUNT_BANNED'
    );
  }

  // Vérifier si l'email existe déjà
  const existingUser = await findUserByEmail(data.email);
  if (existingUser) {
    throw new AppError(409, 'Un compte avec cet email existe déjà', 'EMAIL_EXISTS');
  }

  // Hasher le mot de passe
  const passwordHash = await hashPassword(data.password);

  // Créer l'utilisateur
  const user = await createUser({
    email: data.email,
    passwordHash,
    nom: data.nom,
    prenom: data.prenom,
    numero: data.numero,
    currency: data.currency,
  });

  logger.info(`Nouvel utilisateur créé: ${user.email}`);

  // Créer un compte par défaut pour l'utilisateur
  await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Compte principal',
      type: 'main',
      initialBalance: 0,
      isDefault: true,
    },
  });

  // Générer les tokens
  const tokens = await generateTokensForUser(user);

  // Retourner l'utilisateur (sans password) et les tokens
  const userProfile = await getUserProfile(user.id);
  if (!userProfile) {
    throw new AppError(500, 'Erreur lors de la création du profil');
  }

  return {
    user: userProfile,
    tokens,
  };
};

/**
 * Connexion d'un utilisateur
 */
export const login = async (data: LoginInput): Promise<AuthResponse> => {
  // Vérifier d'abord si ce compte est banni
  const banRecord = await prisma.banRecord.findUnique({
    where: { email: data.email.toLowerCase().trim() },
  });
  if (banRecord) {
    const banDate = new Date(banRecord.bannedAt).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    throw new AppError(
      403,
      `Ce compte a été suspendu le ${banDate}. Motif réel de bannissement : "${banRecord.reason}". Rendez-vous dans le Centre d'aide pour faire un recours.`,
      'ACCOUNT_BANNED'
    );
  }

  // Trouver l'utilisateur
  const user = await findUserByEmail(data.email);
  if (!user) {
    throw new AppError(401, 'Email ou mot de passe incorrect', 'INVALID_CREDENTIALS');
  }

  // Vérifier le mot de passe
  const isPasswordValid = await comparePassword(data.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError(401, 'Email ou mot de passe incorrect', 'INVALID_CREDENTIALS');
  }

  logger.info(`Utilisateur connecté: ${user.email}`);

  // Générer les tokens
  const tokens = await generateTokensForUser(user);

  // Retourner l'utilisateur (sans password) et les tokens
  const userProfile = await getUserProfile(user.id);
  if (!userProfile) {
    throw new AppError(500, 'Erreur lors de la récupération du profil');
  }

  return {
    user: userProfile,
    tokens,
  };
};

/**
 * Renouveler les tokens avec un refresh token
 */
export const refreshTokens = async (data: RefreshInput): Promise<AuthTokens> => {
  // Vérifier le refresh token
  let payload;
  try {
    payload = verifyRefreshToken(data.refreshToken);
  } catch (error) {
    throw new AppError(401, 'Refresh token invalide ou expiré', 'INVALID_REFRESH_TOKEN');
  }

  // Vérifier que le token existe en base
  const tokenRecord = await findRefreshToken(data.refreshToken);
  if (!tokenRecord) {
    throw new AppError(401, 'Refresh token révoqué', 'TOKEN_REVOKED');
  }

  // Vérifier que le token n'est pas expiré (double check)
  if (tokenRecord.expiresAt < new Date()) {
    await deleteRefreshToken(data.refreshToken);
    throw new AppError(401, 'Refresh token expiré', 'TOKEN_EXPIRED');
  }

  // Trouver l'utilisateur
  const user = await findUserById(payload.userId);
  if (!user) {
    throw new AppError(401, 'Utilisateur non trouvé', 'USER_NOT_FOUND');
  }

  // Supprimer l'ancien refresh token
  await deleteRefreshToken(data.refreshToken);

  // Générer de nouveaux tokens
  const tokens = await generateTokensForUser(user);

  logger.info(`Tokens renouvelés pour: ${user.email}`);

  return tokens;
};

/**
 * Déconnexion (supprimer le refresh token)
 */
export const logout = async (refreshToken?: string): Promise<void> => {
  if (refreshToken) {
    await deleteRefreshToken(refreshToken);
    logger.info('Refresh token supprimé lors du logout');
  }
};

/**
 * Déconnexion de tous les appareils (supprimer tous les tokens)
 */
export const logoutAll = async (userId: string): Promise<void> => {
  await deleteUserTokens(userId);
  logger.info(`Tous les tokens supprimés pour l'utilisateur: ${userId}`);
};

/**
 * Obtenir l'utilisateur courant
 */
export const getCurrentUser = async (userId: string) => {
  const user = await getUserProfile(userId);
  if (!user) {
    throw new AppError(404, 'Utilisateur non trouvé', 'USER_NOT_FOUND');
  }
  return user;
};

// =============================================================================
// HELPERS INTERNES
// =============================================================================

/**
 * Générer les tokens pour un utilisateur
 */
const generateTokensForUser = async (user: User): Promise<AuthTokens> => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role || 'user',
  };

  // Générer access token
  const accessToken = generateAccessToken(payload);

  // Générer refresh token
  const refreshToken = generateRefreshToken(payload);

  // Calculer la date d'expiration du refresh token (7 jours)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Sauvegarder le refresh token en base
  await saveRefreshToken(user.id, refreshToken, expiresAt);

  return {
    accessToken,
    refreshToken,
  };
};
