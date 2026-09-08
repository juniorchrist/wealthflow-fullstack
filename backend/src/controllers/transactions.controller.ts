import { Request, Response, NextFunction } from 'express';
import {
  getUserTransactions,
  getTransaction,
  createUserTransaction,
  updateUserTransaction,
  deleteUserTransaction,
  getTransactionStats,
} from '../services/transactions.service';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionParams,
  TransactionFilters,
} from '../validators/transaction.validator';

/**
 * Lister les transactions avec filtres et pagination
 * GET /api/transactions
 */
export const listTransactionsHandler = async (
  req: Request<{}, {}, {}, TransactionFilters>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const result = await getUserTransactions(userId, req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir une transaction par ID
 * GET /api/transactions/:id
 */
export const getTransactionHandler = async (
  req: Request<TransactionParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const transaction = await getTransaction(req.params.id, userId);

    res.status(200).json({
      success: true,
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer une transaction
 * POST /api/transactions
 */
export const createTransactionHandler = async (
  req: Request<{}, {}, CreateTransactionInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const transaction = await createUserTransaction(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Transaction créée avec succès',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour une transaction
 * PATCH /api/transactions/:id
 */
export const updateTransactionHandler = async (
  req: Request<TransactionParams, {}, UpdateTransactionInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const transaction = await updateUserTransaction(req.params.id, userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Transaction mise à jour avec succès',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer une transaction
 * DELETE /api/transactions/:id
 */
export const deleteTransactionHandler = async (
  req: Request<TransactionParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    await deleteUserTransaction(req.params.id, userId);

    res.status(200).json({
      success: true,
      message: 'Transaction supprimée avec succès',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les statistiques de transactions
 * GET /api/transactions/stats
 */
export const getStatsHandler = async (
  req: Request<{}, {}, {}, { startDate?: string; endDate?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const stats = await getTransactionStats(
      userId,
      req.query.startDate,
      req.query.endDate
    );

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};
