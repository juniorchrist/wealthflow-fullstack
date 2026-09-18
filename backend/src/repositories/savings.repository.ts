import { prisma } from '../lib/prisma';
import { SavingsGoal, SavingsDeposit } from '@prisma/client';

export interface CreateSavingsGoalData {
  userId: string;
  title: string;
  targetAmount: number;
  deadline: string;
  icon?: string;
  color?: string;
  description?: string | null;
  checkboxesCount?: number;
  checkedBoxes?: any;
  isAutoSaveActive?: boolean;
  autoSaveAmount?: number | null;
}

export interface UpdateSavingsGoalData {
  title?: string;
  targetAmount?: number;
  deadline?: string;
  icon?: string;
  color?: string;
  description?: string | null;
  checkboxesCount?: number;
  checkedBoxes?: any;
  isAutoSaveActive?: boolean;
  autoSaveAmount?: number | null;
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

  // Calculer currentAmount pour chaque objectif (dépôts + paliers cochés)
  return goals.map((goal) => {
    const depositsAmount = goal.deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
    const boxesCount = goal.checkboxesCount || 10;
    const checkedBoxes = Array.isArray(goal.checkedBoxes) ? (goal.checkedBoxes as number[]) : [];
    const milestoneAmount = Math.round((checkedBoxes.length / boxesCount) * goal.targetAmount);
    const currentAmount = milestoneAmount + depositsAmount;

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

  const depositsAmount = goal.deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
  const boxesCount = goal.checkboxesCount || 10;
  const checkedBoxes = Array.isArray(goal.checkedBoxes) ? (goal.checkedBoxes as number[]) : [];
  const milestoneAmount = Math.round((checkedBoxes.length / boxesCount) * goal.targetAmount);
  const currentAmount = milestoneAmount + depositsAmount;

  const progress = goal.targetAmount > 0 
    ? Math.round((currentAmount / goal.targetAmount) * 100) 
    : 0;

  return {
    ...goal,
    currentAmount,
    progress,
  };
};

export const createSavingsGoal = async (data: CreateSavingsGoalData): Promise<SavingsGoal> => {
  return prisma.savingsGoal.create({
    data: {
      userId: data.userId,
      title: data.title,
      targetAmount: data.targetAmount,
      deadline: data.deadline || '',
      icon: data.icon || 'PiggyBank',
      color: data.color || '#FF5330',
      description: data.description || null,
      checkboxesCount: data.checkboxesCount || 10,
      checkedBoxes: data.checkedBoxes || [],
      isAutoSaveActive: data.isAutoSaveActive || false,
      autoSaveAmount: data.autoSaveAmount || null,
    },
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

  // Trouver ou créer une catégorie pour l'épargne
  let category = await prisma.category.findFirst({
    where: {
      OR: [
        { name: { contains: 'Épargne', mode: 'insensitive' } },
        { isDefault: true },
      ],
    },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        id: 'default-epargne-auto',
        name: 'Épargne & Investissement',
        icon: 'PiggyBank',
        color: '#FF5330',
        type: 'expense',
        isDefault: true,
      },
    });
  }

  const depositDate = date || new Date();

  return prisma.$transaction(async (tx) => {
    // 1. Créer la transaction de type savings_deposit
    const transaction = await tx.transaction.create({
      data: {
        userId,
        categoryId: category.id,
        title: `Dépôt - ${goal.title}`,
        amount,
        type: 'savings_deposit',
        date: depositDate,
      },
    });

    // 2. Créer le SavingsDeposit lié à la transaction
    return tx.savingsDeposit.create({
      data: {
        goalId,
        transactionId: transaction.id,
        amount,
        date: depositDate,
      },
    });
  });
};
