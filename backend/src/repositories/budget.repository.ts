import { prisma } from '../lib/prisma';
import { Budget, BudgetCategory } from '@prisma/client';

export interface CreateBudgetData {
  userId: string;
  month: string;
  totalBudget: number;
  categories: Array<{
    categoryId: string;
    limit: number;
  }>;
}

export interface UpdateBudgetData {
  totalBudget?: number;
  categories?: Array<{
    categoryId: string;
    limit: number;
  }>;
}

/**
 * Récupérer tous les budgets d'un utilisateur
 */
export const getAllBudgets = async (userId: string, month?: string) => {
  const where: any = { userId };
  if (month) {
    where.month = month;
  }

  return prisma.budget.findMany({
    where,
    include: {
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
      },
    },
    orderBy: { month: 'desc' },
  });
};

/**
 * Récupérer un budget par ID
 */
export const getBudgetById = async (budgetId: string, userId: string) => {
  return prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
    include: {
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Récupérer un budget par mois
 */
export const getBudgetByMonth = async (userId: string, month: string) => {
  return prisma.budget.findFirst({
    where: {
      userId,
      month,
    },
    include: {
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Créer un budget
 */
export const createBudget = async (data: CreateBudgetData): Promise<Budget> => {
  return prisma.budget.create({
    data: {
      userId: data.userId,
      month: data.month,
      totalBudget: data.totalBudget,
      categories: {
        create: data.categories.map((cat) => ({
          categoryId: cat.categoryId,
          limit: cat.limit,
        })),
      },
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });
};

/**
 * Mettre à jour un budget
 */
export const updateBudget = async (
  budgetId: string,
  userId: string,
  data: UpdateBudgetData
): Promise<Budget> => {
  // Vérifier que le budget appartient à l'utilisateur
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
  });

  if (!budget) {
    throw new Error('Budget non trouvé');
  }

  // Mettre à jour le budget
  const updateData: any = {};
  if (data.totalBudget !== undefined) {
    updateData.totalBudget = data.totalBudget;
  }

  // Si des catégories sont fournies, supprimer les anciennes et créer les nouvelles
  if (data.categories) {
    await prisma.budgetCategory.deleteMany({
      where: { budgetId },
    });
  }

  return prisma.budget.update({
    where: { id: budgetId },
    data: {
      ...updateData,
      ...(data.categories && {
        categories: {
          create: data.categories.map((cat) => ({
            categoryId: cat.categoryId,
            limit: cat.limit,
          })),
        },
      }),
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });
};

/**
 * Supprimer un budget
 */
export const deleteBudget = async (budgetId: string, userId: string): Promise<Budget> => {
  // Vérifier que le budget appartient à l'utilisateur
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
  });

  if (!budget) {
    throw new Error('Budget non trouvé');
  }

  // Supprimer le budget (les catégories seront supprimées en cascade)
  return prisma.budget.delete({
    where: { id: budgetId },
  });
};

/**
 * Calculer les dépenses par catégorie pour un mois donné
 */
export const getSpentByCategory = async (userId: string, month: string) => {
  // Parser le mois pour obtenir les dates de début et fin
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'expense',
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      categoryId: true,
      amount: true,
    },
  });

  // Grouper par catégorie
  const spentByCategory: Record<string, number> = {};
  transactions.forEach((tx) => {
    spentByCategory[tx.categoryId] = (spentByCategory[tx.categoryId] || 0) + tx.amount;
  });

  return spentByCategory;
};
