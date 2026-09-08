import { Request, Response, NextFunction } from 'express';
import {
  getCategories,
  getCategory,
  createUserCategory,
  updateUserCategory,
  deleteUserCategory,
} from '../services/categories.service';
import { CreateCategoryInput, UpdateCategoryInput, CategoryParams } from '../validators/category.validator';

/**
 * Lister toutes les catégories (globales + utilisateur)
 * GET /api/categories
 */
export const listCategoriesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const categories = await getCategories(userId);

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir une catégorie par ID
 * GET /api/categories/:id
 */
export const getCategoryHandler = async (
  req: Request<CategoryParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const category = await getCategory(req.params.id, userId);

    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer une catégorie personnalisée
 * POST /api/categories
 */
export const createCategoryHandler = async (
  req: Request<{}, {}, CreateCategoryInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const category = await createUserCategory(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour une catégorie personnalisée
 * PATCH /api/categories/:id
 */
export const updateCategoryHandler = async (
  req: Request<CategoryParams, {}, UpdateCategoryInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const category = await updateUserCategory(req.params.id, userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer une catégorie personnalisée
 * DELETE /api/categories/:id
 */
export const deleteCategoryHandler = async (
  req: Request<CategoryParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    await deleteUserCategory(req.params.id, userId);

    res.status(200).json({
      success: true,
      message: 'Catégorie supprimée avec succès',
    });
  } catch (error) {
    next(error);
  }
};
