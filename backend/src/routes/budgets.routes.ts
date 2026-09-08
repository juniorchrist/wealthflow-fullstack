import { Router } from 'express';
import {
  listBudgetsHandler,
  getBudgetHandler,
  createBudgetHandler,
  updateBudgetHandler,
  deleteBudgetHandler,
} from '../controllers/budgets.controller';
import {
  createBudgetSchema,
  updateBudgetSchema,
  budgetFiltersSchema,
} from '../validators/budget.validator';
import { validate } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(requireAuth);

/**
 * @route   GET /api/budgets
 * @desc    Lister les budgets (avec filtres optionnels)
 * @access  Private
 */
router.get('/', listBudgetsHandler as any);

/**
 * @route   GET /api/budgets/:id
 * @desc    Obtenir un budget par ID
 * @access  Private
 */
router.get('/:id', getBudgetHandler);

/**
 * @route   POST /api/budgets
 * @desc    Créer un budget
 * @access  Private
 */
router.post(
  '/',
  validate(createBudgetSchema),
  createBudgetHandler
);

/**
 * @route   PATCH /api/budgets/:id
 * @desc    Mettre à jour un budget
 * @access  Private
 */
router.patch(
  '/:id',
  validate(updateBudgetSchema),
  updateBudgetHandler
);

/**
 * @route   DELETE /api/budgets/:id
 * @desc    Supprimer un budget
 * @access  Private
 */
router.delete('/:id', deleteBudgetHandler);

export default router;
