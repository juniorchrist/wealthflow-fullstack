import { prisma } from '../lib/prisma';
import { User } from '@prisma/client';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  nom: string;
  prenom: string;
  numero?: string;
  currency?: string;
  language?: string;
  timezone?: string;
  dateFormat?: string;
  isPinEnabled?: boolean;
  role?: string;
}

export interface UpdateUserData {
  nom?: string;
  prenom?: string;
  numero?: string | null;
  avatar?: string | null;
  currency?: string;
  language?: string;
  timezone?: string;
  dateFormat?: string;
  pinHash?: string;
  isPinEnabled?: boolean;
  autoLockMinutes?: number;
  role?: string;
}

/**
 * Créer un nouvel utilisateur
 */
export const createUser = async (data: CreateUserData): Promise<User> => {
  return prisma.user.create({
    data: {
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      nom: data.nom,
      prenom: data.prenom,
      numero: data.numero,
      currency: data.currency || 'FCFA',
      language: data.language || 'Français',
      timezone: data.timezone || 'GMT +00:00',
      dateFormat: data.dateFormat || 'DD/MM/YYYY',
      isPinEnabled: data.isPinEnabled ?? true,
      role: data.role || 'user',
    },
  });
};

/**
 * Trouver un utilisateur par email
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
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
 * Obtenir tous les utilisateurs pour la vue admin avec toutes les relations financières réelles
 */
export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      nom: true,
      prenom: true,
      numero: true,
      avatar: true,
      currency: true,
      plan: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      transactions: {
        select: {
          id: true,
          title: true,
          amount: true,
          type: true,
          date: true,
        },
        orderBy: { date: 'desc' },
      },
      savingsGoals: {
        select: {
          id: true,
          title: true,
          targetAmount: true,
          deposits: {
            select: {
              id: true,
              amount: true,
              date: true,
            },
          },
        },
      },
      budgets: {
        select: {
          id: true,
          month: true,
          totalBudget: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Supprimer définitivement un utilisateur et toutes ses données en cascade transactionnelle
 */
export const deleteUser = async (userId: string): Promise<User> => {
  return prisma.$transaction(async (tx) => {
    // 1. Supprimer les dépôts d'épargne des objectifs de l'utilisateur
    const goals = await tx.savingsGoal.findMany({
      where: { userId },
      select: { id: true },
    });
    const goalIds = goals.map((g) => g.id);
    if (goalIds.length > 0) {
      await tx.savingsDeposit.deleteMany({
        where: { goalId: { in: goalIds } },
      });
    }

    // 2. Supprimer les objectifs d'épargne
    await tx.savingsGoal.deleteMany({
      where: { userId },
    });

    // 3. Supprimer les budgets et leurs catégories
    const budgets = await tx.budget.findMany({
      where: { userId },
      select: { id: true },
    });
    const budgetIds = budgets.map((b) => b.id);
    if (budgetIds.length > 0) {
      await tx.budgetCategory.deleteMany({
        where: { budgetId: { in: budgetIds } },
      });
      await tx.budget.deleteMany({
        where: { id: { in: budgetIds } },
      });
    }

    // 4. Supprimer les transactions de l'utilisateur
    await tx.transaction.deleteMany({
      where: { userId },
    });

    // 5. Supprimer les catégories personnalisées de l'utilisateur
    await tx.category.deleteMany({
      where: { userId },
    });

    // 6. Supprimer les comptes bancaires / portefeuilles
    await tx.account.deleteMany({
      where: { userId },
    });

    // 7. Supprimer les notifications
    await tx.notification.deleteMany({
      where: { userId },
    });

    // 8. Supprimer les refresh tokens
    await tx.refreshToken.deleteMany({
      where: { userId },
    });

    // 9. Supprimer enfin l'utilisateur
    return tx.user.delete({
      where: { id: userId },
    });
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
      nom: true,
      prenom: true,
      numero: true,
      avatar: true,
      currency: true,
      language: true,
      timezone: true,
      dateFormat: true,
      plan: true,
      role: true,
      isPinEnabled: true,
      autoLockMinutes: true,
      createdAt: true,
      updatedAt: true,
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
