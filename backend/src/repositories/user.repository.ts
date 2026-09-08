import { prisma } from '../lib/prisma';
import { User } from '@prisma/client';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  currency?: string;
  language?: string;
  timezone?: string;
  dateFormat?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  avatar?: string | null;
  currency?: string;
  language?: string;
  timezone?: string;
  dateFormat?: string;
  pinHash?: string;
  isPinEnabled?: boolean;
  autoLockMinutes?: number;
}

/**
 * Créer un nouvel utilisateur
 */
export const createUser = async (data: CreateUserData): Promise<User> => {
  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      currency: data.currency || 'FCFA',
      language: data.language || 'Français',
      timezone: data.timezone || 'GMT +00:00',
      dateFormat: data.dateFormat || 'DD/MM/YYYY',
    },
  });
};

/**
 * Trouver un utilisateur par email
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
};

/**
 * Trouver un utilisateur par ID
 */
export const findUserById = async (userId: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id: userId },
  });
};

/**
 * Mettre à jour un utilisateur
 */
export const updateUser = async (
  userId: string,
  data: UpdateUserData
): Promise<User> => {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
};

/**
 * Supprimer un utilisateur (admin uniquement)
 */
export const deleteUser = async (userId: string): Promise<User> => {
  return prisma.user.delete({
    where: { id: userId },
  });
};

/**
 * Obtenir le profil utilisateur (sans passwordHash)
 */
export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      currency: true,
      language: true,
      timezone: true,
      dateFormat: true,
      plan: true,
      isPinEnabled: true,
      autoLockMinutes: true,
      createdAt: true,
      updatedAt: true,
      // Ne pas exposer passwordHash et pinHash
    },
  });

  return user;
};
/**
 * Obtenir un utilisateur par ID (complet avec passwordHash)
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id: userId },
  });
};

/**
 * Mettre à jour les paramètres utilisateur
 */
export const updateUserSettings = async (
  userId: string,
  data: UpdateUserData
): Promise<User> => {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
};

/**
 * Configurer le PIN utilisateur
 */
export const setupUserPin = async (userId: string, pinHash: string): Promise<void> => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      pinHash,
      isPinEnabled: true,
    },
  });
};

/**
 * Vérifier le PIN utilisateur
 */
export const verifyUserPin = async (userId: string, pinHash: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pinHash: true, isPinEnabled: true },
  });

  if (!user || !user.isPinEnabled || !user.pinHash) {
    return false;
  }

  return user.pinHash === pinHash;
};

/**
 * Désactiver le PIN utilisateur
 */
export const disableUserPin = async (userId: string): Promise<void> => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      pinHash: null,
      isPinEnabled: false,
    },
  });
};
