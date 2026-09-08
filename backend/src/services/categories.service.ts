import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../repositories/category.repository';
import { AppError } from '../middleware/errorHandler';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator';

/**
 * Récupérer toutes les catégories (globales + utilisateur)
 */
export const getCategories = async (userId: string) => {
  return getAllCategories(userId);
};

/**
 * Récupérer une catégorie par ID
 */
export const getCategory = async (categoryId: string, userId: string) => {
  const category = await getCategoryById(categoryId, userId);
  
  if (!category) {
    throw new AppError(404, 'Catégorie non trouvée', 'CATEGORY_NOT_FOUND');
  }
  
  return category;
};

/**
 * Créer une catégorie personnalisée
 */
export const createUserCategory = async (userId: string, data: CreateCategoryInput) => {
  return createCategory({
    userId,
    name: data.name,
    icon: data.icon,
    color: data.color,
    budgetLimit: data.budgetLimit,
    type: data.type,
  });
};

/**
 * Mettre à jour une catégorie personnalisée
 */
export const updateUserCategory = async (
  categoryId: string,
  userId: string,
  data: UpdateCategoryInput
) => {
  try {
    return await updateCategory(categoryId, userId, data);
  } catch (error) {
    if (error instanceof Error && error.message.includes('non trouvée')) {
      throw new AppError(404, 'Catégorie non trouvée ou non modifiable', 'CATEGORY_NOT_FOUND');
    }
    throw error;
  }
};

/**
 * Supprimer une catégorie personnalisée
 */
export const deleteUserCategory = async (categoryId: string, userId: string) => {
  try {
    return await deleteCategory(categoryId, userId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('non trouvée')) {
      throw new AppError(404, 'Catégorie non trouvée ou non supprimable', 'CATEGORY_NOT_FOUND');
    }
    throw error;
  }
};
