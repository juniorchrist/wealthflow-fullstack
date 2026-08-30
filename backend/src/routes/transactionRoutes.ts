import { Router } from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController';
import { authMiddleware } from '../middleware/auth';

export const transactionRoutes = Router();

transactionRoutes.use(authMiddleware);

transactionRoutes.get('/', getTransactions);
transactionRoutes.get('/:id', getTransactionById);
transactionRoutes.post('/', createTransaction);
transactionRoutes.put('/:id', updateTransaction);
transactionRoutes.delete('/:id', deleteTransaction);
