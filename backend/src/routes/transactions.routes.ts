import { Router } from 'express';
import {
  listTransactionsHandler,
  getTransactionHandler,
  createTransactionHandler,
  updateTransactionHandler,
  deleteTransactionHandler,
  getStatsHandler,
} from '../controllers/transactions.controller';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFiltersSchema,
} from '../validators/transaction.validator';
import { validate } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(requireAuth);

/**
 * @route   GET /api/transactions/stats
 * @desc    Obtenir les statistiques de transactions
 * @access  Private
 */
router.get('/stats', getStatsHandler);

/**
 * @route   GET /api/transactions
 * @desc    Lister les transactions avec filtres et pagination
 * @access  Private
 */
router.get('/', listTransactionsHandler as any);

/**
 * @route   GET /api/transactions/:id
 * @desc    Obtenir une transaction par ID
 * @access  Private
 */
router.get('/:id', getTransactionHandler);

/**
 * @route   POST /api/transactions
 * @desc    Créer une transaction
 * @access  Private
 */
router.post(
  '/',
  validate(createTransactionSchema),
  createTransactionHandler
);

/**
 * @route   PATCH /api/transactions/:id
 * @desc    Mettre à jour une transaction
 * @access  Private
 */
router.patch(
  '/:id',
  validate(updateTransactionSchema),
  updateTransactionHandler
);

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Supprimer une transaction
 * @access  Private
 */
router.delete('/:id', deleteTransactionHandler);

export default router;
