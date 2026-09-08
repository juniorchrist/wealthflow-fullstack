import {
  getAllBudgets,
  getBudgetById,
  getBudgetByMonth,
  createBudget,
  updateBudget,
  deleteBudget,
  getSpentByCategory,
} from '../repositories/budget.repository';
import { AppError } from '../middleware/errorHandler';
import {
  CreateBudgetInput,
  UpdateBudgetInput,
  BudgetFilters,
} from '../validators/budget.validator';

/**
 * Récupérer les budgets avec enrichissement des données
 */
export const getBudgets = async (userId: string, filters: BudgetFilters) => {
  const budgets = await getAllBudgets(userId, filters.month);

  // Enrichir chaque budget avec les dépenses réelles
  const enrichedBudgets = await Promise.all(
    budgets.map(async (budget) => {
      const spent = await getSpentByCategory(userId, budget.month);

      // Calculer pour chaque catégorie
      const categoriesWithSpent = budget.categories.map((budgetCat) => {
        const spentAmount = spent[budgetCat.categoryId] || 0;
        const remaining = Math.max(0, budgetCat.limit - spentAmount);
        const percentage = budgetCat.limit > 0
          ? Math.min(100, Math.round((spentAmount / budgetCat.limit) * 100))
          : 0;

        return {
          id: budgetCat.id,
          categoryId: budgetCat.categoryId,
          category: budgetCat.category,
          limit: budgetCat.limit,
          spent: spentAmount,
          remaining,
          percentage,
        };
      });

      // Calculer les totaux
      const totalSpent = Object.values(spent).reduce((sum, amount) => sum + amount, 0);
      const totalRemaining = Math.max(0, budget.totalBudget - totalSpent);
      const totalPercentage = budget.totalBudget > 0
        ? Math.min(100, Math.round((totalSpent / budget.totalBudget) * 100))
        : 0;

      return {
        id: budget.id,
        month: budget.month,
        totalBudget: budget.totalBudget,
        totalSpent,
        totalRemaining,
        totalPercentage,
        categories: categoriesWithSpent,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
      };
    })
  );

  return enrichedBudgets;
};

/**
 * Récupérer un budget par ID
 */
export const getBudget = async (budgetId: string, userId: string) => {
  const budget = await getBudgetById(budgetId, userId);

  if (!budget) {
    throw new AppError(404, 'Budget non trouvé', 'BUDGET_NOT_FOUND');
  }

  // Enrichir avec les dépenses
  const spent = await getSpentByCategory(userId, budget.month);

  const categoriesWithSpent = budget.categories.map((budgetCat) => {
    const spentAmount = spent[budgetCat.categoryId] || 0;
    const remaining = Math.max(0, budgetCat.limit - spentAmount);
    const percentage = budgetCat.limit > 0
      ? Math.min(100, Math.round((spentAmount / budgetCat.limit) * 100))
      : 0;

    return {
      id: budgetCat.id,
      categoryId: budgetCat.categoryId,
      category: budgetCat.category,
      limit: budgetCat.limit,
      spent: spentAmount,
      remaining,
      percentage,
    };
  });

  const totalSpent = Object.values(spent).reduce((sum, amount) => sum + amount, 0);
  const totalRemaining = Math.max(0, budget.totalBudget - totalSpent);
  const totalPercentage = budget.totalBudget > 0
    ? Math.min(100, Math.round((totalSpent / budget.totalBudget) * 100))
    : 0;

  return {
    id: budget.id,
    month: budget.month,
    totalBudget: budget.totalBudget,
    totalSpent,
    totalRemaining,
    totalPercentage,
    categories: categoriesWithSpent,
    createdAt: budget.createdAt,
    updatedAt: budget.updatedAt,
  };
};

/**
 * Créer un budget
 */
export const createUserBudget = async (userId: string, data: CreateBudgetInput) => {
  // Vérifier qu'un budget n'existe pas déjà pour ce mois
  const existing = await getBudgetByMonth(userId, data.month);
  if (existing) {
    throw new AppError(
      409,
      'Un budget existe déjà pour ce mois',
      'BUDGET_ALREADY_EXISTS'
    );
  }

  return createBudget({
    userId,
    month: data.month,
    totalBudget: data.totalBudget,
    categories: data.categories,
  });
};

/**
 * Mettre à jour un budget
 */
export const updateUserBudget = async (
  budgetId: string,
  userId: string,
  data: UpdateBudgetInput
) => {
  try {
    return await updateBudget(budgetId, userId, data);
  } catch (error) {
    if (error instanceof Error && error.message.includes('non trouvé')) {
      throw new AppError(404, 'Budget non trouvé', 'BUDGET_NOT_FOUND');
    }
    throw error;
  }
};

/**
 * Supprimer un budget
 */
export const deleteUserBudget = async (budgetId: string, userId: string) => {
  try {
    return await deleteBudget(budgetId, userId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('non trouvé')) {
      throw new AppError(404, 'Budget non trouvé', 'BUDGET_NOT_FOUND');
    }
    throw error;
  }
};
