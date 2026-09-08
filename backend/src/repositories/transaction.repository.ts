import { prisma } from '../lib/prisma';
import { Transaction, Prisma } from '@prisma/client';

export interface CreateTransactionData {
  userId: string;
  title: string;
  amount: number;
  type: string;
  categoryId: string;
  accountId?: string;
  date: Date;
  time?: string;
  notes?: string;
}

export interface UpdateTransactionData {
  title?: string;
  amount?: number;
  type?: string;
  categoryId?: string;
  accountId?: string | null;
  date?: Date;
  time?: string | null;
  notes?: string | null;
}

export interface TransactionFilters {
  type?: string;
  categoryId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Récupérer les transactions avec filtres et pagination
 */
export const getTransactions = async (userId: string, filters: TransactionFilters) => {
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 100); // Max 100 par page
  const skip = (page - 1) * limit;

  // Construction des conditions WHERE
  const where: Prisma.TransactionWhereInput = {
    userId,
  };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.accountId) {
    where.accountId = filters.accountId;
  }

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.date.lte = new Date(filters.endDate);
    }
  }

  // Récupérer les transactions et le total
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            type: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Récupérer une transaction par ID
 */
export const getTransactionById = async (
  transactionId: string,
  userId: string
): Promise<Transaction | null> => {
  return prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
    include: {
      category: true,
      account: true,
    },
  });
};

/**
 * Créer une transaction
 */
export const createTransaction = async (data: CreateTransactionData): Promise<Transaction> => {
  return prisma.transaction.create({
    data,
    include: {
      category: true,
      account: true,
    },
  });
};

/**
 * Mettre à jour une transaction
 */
export const updateTransaction = async (
  transactionId: string,
  userId: string,
  data: UpdateTransactionData
): Promise<Transaction> => {
  // Vérifier que la transaction appartient à l'utilisateur
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
  });

  if (!transaction) {
    throw new Error('Transaction non trouvée');
  }

  return prisma.transaction.update({
    where: { id: transactionId },
    data,
    include: {
      category: true,
      account: true,
    },
  });
};

/**
 * Supprimer une transaction
 */
export const deleteTransaction = async (
  transactionId: string,
  userId: string
): Promise<Transaction> => {
  // Vérifier que la transaction appartient à l'utilisateur
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
  });

  if (!transaction) {
    throw new Error('Transaction non trouvée');
  }

  return prisma.transaction.delete({
    where: { id: transactionId },
  });
};

/**
 * Calculer le total des revenus
 */
export const getTotalIncome = async (userId: string, startDate?: Date, endDate?: Date): Promise<number> => {
  const where: Prisma.TransactionWhereInput = {
    userId,
    type: 'income',
  };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }

  const result = await prisma.transaction.aggregate({
    where,
    _sum: {
      amount: true,
    },
  });

  return result._sum.amount || 0;
};

/**
 * Calculer le total des dépenses
 */
export const getTotalExpenses = async (userId: string, startDate?: Date, endDate?: Date): Promise<number> => {
  const where: Prisma.TransactionWhereInput = {
    userId,
    type: 'expense',
  };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }

  const result = await prisma.transaction.aggregate({
    where,
    _sum: {
      amount: true,
    },
  });

  return result._sum.amount || 0;
};

/**
 * Récupérer les transactions récentes
 */
export const getRecentTransactions = async (userId: string, limit: number = 5) => {
  return prisma.transaction.findMany({
    where: { userId },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
      },
      account: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { date: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  });
};
