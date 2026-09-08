import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTotalIncome,
  getTotalExpenses,
} from '../repositories/transaction.repository';
import { getCategoryById } from '../repositories/category.repository';
import { AppError } from '../middleware/errorHandler';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
} from '../validators/transaction.validator';

/**
 * Récupérer les transactions avec filtres et pagination
 */
export const getUserTransactions = async (userId: string, filters: TransactionFilters) => {
  return getTransactions(userId, filters);
};

/**
 * Récupérer une transaction par ID
 */
export const getTransaction = async (transactionId: string, userId: string) => {
  const transaction = await getTransactionById(transactionId, userId);

  if (!transaction) {
    throw new AppError(404, 'Transaction non trouvée', 'TRANSACTION_NOT_FOUND');
  }

  return transaction;
};

/**
 * Créer une transaction
 */
export const createUserTransaction = async (userId: string, data: CreateTransactionInput) => {
  // Vérifier que la catégorie existe et appartient à l'utilisateur (ou est globale)
  const category = await getCategoryById(data.categoryId, userId);
  if (!category) {
    throw new AppError(404, 'Catégorie non trouvée', 'CATEGORY_NOT_FOUND');
  }

  // Convertir la date string en Date
  const date = new Date(data.date);

  return createTransaction({
    userId,
    title: data.title,
    amount: data.amount,
    type: data.type,
    categoryId: data.categoryId,
    accountId: data.accountId,
    date,
    time: data.time,
    notes: data.notes,
  });
};

/**
 * Mettre à jour une transaction
 */
export const updateUserTransaction = async (
  transactionId: string,
  userId: string,
  data: UpdateTransactionInput
) => {
  // Si categoryId est fourni, vérifier qu'elle existe
  if (data.categoryId) {
    const category = await getCategoryById(data.categoryId, userId);
    if (!category) {
      throw new AppError(404, 'Catégorie non trouvée', 'CATEGORY_NOT_FOUND');
    }
  }

  // Convertir la date si fournie
  const updateData: any = { ...data };
  if (data.date) {
    updateData.date = new Date(data.date);
  }

  try {
    return await updateTransaction(transactionId, userId, updateData);
  } catch (error) {
    if (error instanceof Error && error.message.includes('non trouvée')) {
      throw new AppError(404, 'Transaction non trouvée', 'TRANSACTION_NOT_FOUND');
    }
    throw error;
  }
};

/**
 * Supprimer une transaction
 */
export const deleteUserTransaction = async (transactionId: string, userId: string) => {
  try {
    return await deleteTransaction(transactionId, userId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('non trouvée')) {
      throw new AppError(404, 'Transaction non trouvée', 'TRANSACTION_NOT_FOUND');
    }
    throw error;
  }
};

/**
 * Obtenir les statistiques de transactions
 */
export const getTransactionStats = async (
  userId: string,
  startDate?: string,
  endDate?: string
) => {
  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;

  const [totalIncome, totalExpenses] = await Promise.all([
    getTotalIncome(userId, start, end),
    getTotalExpenses(userId, start, end),
  ]);

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    period: {
      startDate,
      endDate,
    },
  };
};
