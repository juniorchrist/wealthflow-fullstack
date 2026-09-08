import { Router } from 'express';
import {
  listSavingsGoalsHandler,
  getSavingsGoalHandler,
  createSavingsGoalHandler,
  updateSavingsGoalHandler,
  deleteSavingsGoalHandler,
  addDepositHandler,
} from '../controllers/savings.controller';
import {
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
  addDepositSchema,
} from '../validators/savings.validator';
import { validate } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(requireAuth);

/**
 * @route   GET /api/savings-goals
 * @desc    Lister tous les objectifs d'épargne
 * @access  Private
 */
router.get('/', listSavingsGoalsHandler);

/**
 * @route   GET /api/savings-goals/:id
 * @desc    Obtenir un objectif par ID
 * @access  Private
 */
router.get('/:id', getSavingsGoalHandler);

/**
 * @route   POST /api/savings-goals
 * @desc    Créer un objectif d'épargne
 * @access  Private
 */
router.post(
  '/',
  validate(createSavingsGoalSchema),
  createSavingsGoalHandler
);

/**
 * @route   PATCH /api/savings-goals/:id
 * @desc    Mettre à jour un objectif
 * @access  Private
 */
router.patch(
  '/:id',
  validate(updateSavingsGoalSchema),
  updateSavingsGoalHandler
);

/**
 * @route   DELETE /api/savings-goals/:id
 * @desc    Supprimer un objectif
 * @access  Private
 */
router.delete('/:id', deleteSavingsGoalHandler);

/**
 * @route   POST /api/savings-goals/:id/deposits
 * @desc    Ajouter un dépôt à un objectif
 * @access  Private
 */
router.post(
  '/:id/deposits',
  validate(addDepositSchema),
  addDepositHandler
);

export default router;
