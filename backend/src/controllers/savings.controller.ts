import { Request, Response, NextFunction } from 'express';
import {
  getSavingsGoals,
  getSavingsGoal,
  createUserSavingsGoal,
  updateUserSavingsGoal,
  deleteUserSavingsGoal,
  addDepositToGoal,
} from '../services/savings.service';
import {
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
  SavingsGoalParams,
  AddDepositInput,
} from '../validators/savings.validator';

/**
 * Lister tous les objectifs d'épargne
 * GET /api/savings-goals
 */
export const listSavingsGoalsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const goals = await getSavingsGoals(userId);

    res.status(200).json({
      success: true,
      data: { goals },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir un objectif par ID
 * GET /api/savings-goals/:id
 */
export const getSavingsGoalHandler = async (
  req: Request<SavingsGoalParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const goal = await getSavingsGoal(req.params.id, userId);

    res.status(200).json({
      success: true,
      data: { goal },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un objectif d'épargne
 * POST /api/savings-goals
 */
export const createSavingsGoalHandler = async (
  req: Request<{}, {}, CreateSavingsGoalInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const goal = await createUserSavingsGoal(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Objectif d\'épargne créé avec succès',
      data: { goal },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un objectif
 * PATCH /api/savings-goals/:id
 */
export const updateSavingsGoalHandler = async (
  req: Request<SavingsGoalParams, {}, UpdateSavingsGoalInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const goal = await updateUserSavingsGoal(req.params.id, userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Objectif mis à jour avec succès',
      data: { goal },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un objectif
 * DELETE /api/savings-goals/:id
 */
export const deleteSavingsGoalHandler = async (
  req: Request<SavingsGoalParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    await deleteUserSavingsGoal(req.params.id, userId);

    res.status(200).json({
      success: true,
      message: 'Objectif supprimé avec succès',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ajouter un dépôt à un objectif
 * POST /api/savings-goals/:id/deposits
 */
export const addDepositHandler = async (
  req: Request<SavingsGoalParams, {}, AddDepositInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const deposit = await addDepositToGoal(req.params.id, userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Dépôt ajouté avec succès',
      data: { deposit },
    });
  } catch (error) {
    next(error);
  }
};
