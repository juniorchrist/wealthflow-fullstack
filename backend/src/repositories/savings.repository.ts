import { prisma } from '../lib/prisma';
import { SavingsGoal, SavingsDeposit } from '@prisma/client';

export interface CreateSavingsGoalData {
  userId: string;
  title: string;
  targetAmount: number;
  deadline: string;
  icon: string;
  color: string;
}

export interface UpdateSavingsGoalData {
  title?: string;
  targetAmount?: number;
  deadline?: string; // Format String dans Prisma
  icon?: string;
  color?: string;
}

/**
 * Récupérer tous les objectifs d'épargne d'un utilisateur
 */
export const getAllSavingsGoals = async (userId: string) => {
  const goals = await prisma.savingsGoal.findMany({
    where: { userId },
    include: {
      deposits: {
        orderBy: { date: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculer currentAmount pour chaque objectif
  return goals.map((goal) => {
    const currentAmount = goal.deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
    const progress = goal.targetAmount > 0 
      ? Math.round((currentAmount / goal.targetAmount) * 100) 
      : 0;

    return {
      ...goal,
      currentAmount,
      progress,
    };
  });
};

/**
 * Récupérer un objectif par ID
 */
export const getSavingsGoalById = async (goalId: string, userId: string) => {
  const goal = await prisma.savingsGoal.findFirst({
    where: {
      id: goalId,
      userId,
    },
    include: {
      deposits: {
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!goal) return null;

  const currentAmount = goal.deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
  const progress = goal.targetAmount > 0 
    ? Math.round((currentAmount / goal.targetAmount) * 100) 
    : 0;

  return {
    ...goal,
    currentAmount,
    progress,
  };
};

/**
 * Créer un objectif d'épargne
 */
export const createSavingsGoal = async (data: CreateSavingsGoalData): Promise<SavingsGoal> => {
  return prisma.savingsGoal.create({
    data,
  });
};

/**
 * Mettre à jour un objectif
 */
export const updateSavingsGoal = async (
  goalId: string,
  userId: string,
  data: UpdateSavingsGoalData
): Promise<SavingsGoal> => {
  // Vérifier que l'objectif appartient à l'utilisateur
  const goal = await prisma.savingsGoal.findFirst({
    where: {
      id: goalId,
      userId,
    },
  });

  if (!goal) {
    throw new Error('Objectif d\'épargne non trouvé');
  }

  return prisma.savingsGoal.update({
    where: { id: goalId },
    data,
  });
};

/**
 * Supprimer un objectif
 */
export const deleteSavingsGoal = async (goalId: string, userId: string): Promise<SavingsGoal> => {
  // Vérifier que l'objectif appartient à l'utilisateur
  const goal = await prisma.savingsGoal.findFirst({
    where: {
      id: goalId,
      userId,
    },
  });

  if (!goal) {
    throw new Error('Objectif d\'épargne non trouvé');
  }

  // Supprimer l'objectif (les deposits seront supprimés en cascade)
  return prisma.savingsGoal.delete({
    where: { id: goalId },
  });
};

/**
 * Ajouter un dépôt à un objectif
 */
export const addDeposit = async (
  goalId: string,
  userId: string,
  amount: number,
  date?: Date
): Promise<SavingsDeposit> => {
  // Vérifier que l'objectif appartient à l'utilisateur
  const goal = await prisma.savingsGoal.findFirst({
    where: {
      id: goalId,
      userId,
    },
  });

  if (!goal) {
    throw new Error('Objectif d\'épargne non trouvé');
  }

  // Créer une transaction de type savings_deposit
  const depositDate = date || new Date();
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      categoryId: 'default-epargne-revenus', // Catégorie par défaut épargne
      title: `Dépôt - ${goal.title}`,
      amount,
      type: 'savings_deposit',
      date: depositDate,
    },
  });

  // Créer le SavingsDeposit lié à la transaction
  return prisma.savingsDeposit.create({
    data: {
      goalId,
      transactionId: transaction.id,
      amount,
      date: depositDate,
    },
  });
};
