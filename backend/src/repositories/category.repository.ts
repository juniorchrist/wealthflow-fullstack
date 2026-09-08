import { prisma } from '../lib/prisma';
import { Category } from '@prisma/client';

export interface CreateCategoryData {
  userId: string;
  name: string;
  icon: string;
  color: string;
  budgetLimit: number;
  type: string;
}

export interface UpdateCategoryData {
  name?: string;
  icon?: string;
  color?: string;
  budgetLimit?: number;
}

/**
 * Récupérer toutes les catégories (globales + utilisateur)
 */
export const getAllCategories = async (userId: string): Promise<Category[]> => {
  return prisma.category.findMany({
    where: {
      OR: [
        { userId: null, isDefault: true }, // Catégories globales
        { userId }, // Catégories de l'utilisateur
      ],
    },
    orderBy: [
      { isDefault: 'desc' }, // Globales en premier
      { type: 'asc' }, // expense avant income
      { name: 'asc' },
    ],
  });
};

/**
 * Récupérer une catégorie par ID
 */
export const getCategoryById = async (
  categoryId: string,
  userId: string
): Promise<Category | null> => {
  return prisma.category.findFirst({
    where: {
      id: categoryId,
      OR: [
        { userId: null, isDefault: true },
        { userId },
      ],
    },
  });
};

/**
 * Créer une catégorie personnalisée
 */
export const createCategory = async (data: CreateCategoryData): Promise<Category> => {
  return prisma.category.create({
    data: {
      userId: data.userId,
      name: data.name,
      icon: data.icon,
      color: data.color,
      budgetLimit: data.budgetLimit,
      type: data.type,
      isDefault: false, // Les catégories utilisateur ne sont jamais par défaut
    },
  });
};

/**
 * Mettre à jour une catégorie personnalisée
 */
export const updateCategory = async (
  categoryId: string,
  userId: string,
  data: UpdateCategoryData
): Promise<Category> => {
  // Vérifier que la catégorie appartient bien à l'utilisateur
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId, // Seulement les catégories de l'utilisateur (pas les globales)
    },
  });

  if (!category) {
    throw new Error('Catégorie non trouvée ou non modifiable');
  }

  return prisma.category.update({
    where: { id: categoryId },
    data,
  });
};

/**
 * Supprimer une catégorie personnalisée
 */
export const deleteCategory = async (
  categoryId: string,
  userId: string
): Promise<Category> => {
  // Vérifier que la catégorie appartient bien à l'utilisateur
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });

  if (!category) {
    throw new Error('Catégorie non trouvée ou non supprimable');
  }

  return prisma.category.delete({
    where: { id: categoryId },
  });
};

/**
 * Obtenir les catégories par défaut (globales)
 */
export const getDefaultCategories = async (): Promise<Category[]> => {
  return prisma.category.findMany({
    where: {
      userId: null,
      isDefault: true,
    },
    orderBy: [
      { type: 'asc' },
      { name: 'asc' },
    ],
  });
};

/**
 * Obtenir les catégories personnalisées d'un utilisateur
 */
export const getUserCategories = async (userId: string): Promise<Category[]> => {
  return prisma.category.findMany({
    where: { userId },
    orderBy: [
      { type: 'asc' },
      { name: 'asc' },
    ],
  });
};
