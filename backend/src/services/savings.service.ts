import {
  getAllSavingsGoals,
  getSavingsGoalById,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  addDeposit,
} from '../repositories/savings.repository';
import { AppError } from '../middleware/errorHandler';
import {
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
  AddDepositInput,
} from '../validators/savings.validator';

/**
 * Récupérer tous les objectifs d'épargne
 */
export const getSavingsGoals = async (userId: string) => {
  return getAllSavingsGoals(userId);
};

/**
 * Récupérer un objectif par ID
 */
export const getSavingsGoal = async (goalId: string, userId: string) => {
  const goal = await getSavingsGoalById(goalId, userId);

  if (!goal) {
    throw new AppError(404, 'Objectif d\'épargne non trouvé', 'SAVINGS_GOAL_NOT_FOUND');
  }

  return goal;
};

/**
 * Créer un objectif d'épargne
 */
export const createUserSavingsGoal = async (userId: string, data: CreateSavingsGoalInput) => {
  // La deadline reste en format string (comme dans Prisma)
  return createSavingsGoal({
    userId,
    title: data.title,
    targetAmount: data.targetAmount,
    deadline: data.deadline, // String directement
    icon: data.icon,
    color: data.color,
  });
};

/**
 * Mettre à jour un objectif
 */
export const updateUserSavingsGoal = async (
  goalId: string,
  userId: string,
  data: UpdateSavingsGoalInput
) => {
  // La deadline reste en format string si fournie
  try {
    return await updateSavingsGoal(goalId, userId, data);
  } catch (error) {
    if (error instanceof Error && error.message.includes('non trouvé')) {
      throw new AppError(404, 'Objectif d\'épargne non trouvé', 'SAVINGS_GOAL_NOT_FOUND');
    }
    throw error;
  }
};

/**
 * Supprimer un objectif
 */
export const deleteUserSavingsGoal = async (goalId: string, userId: string) => {
  try {
    return await deleteSavingsGoal(goalId, userId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('non trouvé')) {
      throw new AppError(404, 'Objectif d\'épargne non trouvé', 'SAVINGS_GOAL_NOT_FOUND');
    }
    throw error;
  }
};

/**
 * Ajouter un dépôt à un objectif
 */
export const addDepositToGoal = async (
  goalId: string,
  userId: string,
  data: AddDepositInput
) => {
  const date = data.date ? new Date(data.date) : undefined;

  try {
    return await addDeposit(goalId, userId, data.amount, date);
  } catch (error) {
    if (error instanceof Error && error.message.includes('non trouvé')) {
      throw new AppError(404, 'Objectif d\'épargne non trouvé', 'SAVINGS_GOAL_NOT_FOUND');
    }
    throw error;
  }
};
