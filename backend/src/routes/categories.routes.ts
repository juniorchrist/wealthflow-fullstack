import { Router } from 'express';
import {
  listCategoriesHandler,
  getCategoryHandler,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from '../controllers/categories.controller';
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} from '../validators/category.validator';
import { validate } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(requireAuth);

/**
 * @route   GET /api/categories
 * @desc    Lister toutes les catégories (globales + utilisateur)
 * @access  Private
 */
router.get('/', listCategoriesHandler);

/**
 * @route   GET /api/categories/:id
 * @desc    Obtenir une catégorie par ID
 * @access  Private
 */
router.get('/:id', getCategoryHandler);

/**
 * @route   POST /api/categories
 * @desc    Créer une catégorie personnalisée
 * @access  Private
 */
router.post(
  '/',
  validate(createCategorySchema),
  createCategoryHandler
);

/**
 * @route   PATCH /api/categories/:id
 * @desc    Mettre à jour une catégorie personnalisée
 * @access  Private
 */
router.patch(
  '/:id',
  validate(updateCategorySchema),
  updateCategoryHandler
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Supprimer une catégorie personnalisée
 * @access  Private
 */
router.delete(
  '/:id',
  validate(deleteCategorySchema),
  deleteCategoryHandler
);

export default router;
