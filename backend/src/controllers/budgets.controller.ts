import { Request, Response, NextFunction } from 'express';
import {
  getBudgets,
  getBudget,
  createUserBudget,
  updateUserBudget,
  deleteUserBudget,
} from '../services/budgets.service';
import {
  CreateBudgetInput,
  UpdateBudgetInput,
  BudgetParams,
  BudgetFilters,
} from '../validators/budget.validator';

/**
 * Lister les budgets
 * GET /api/budgets
 */
export const listBudgetsHandler = async (
  req: Request<{}, {}, {}, BudgetFilters>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const budgets = await getBudgets(userId, req.query);

    res.status(200).json({
      success: true,
      data: { budgets },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir un budget par ID
 * GET /api/budgets/:id
 */
export const getBudgetHandler = async (
  req: Request<BudgetParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const budget = await getBudget(req.params.id, userId);

    res.status(200).json({
      success: true,
      data: { budget },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un budget
 * POST /api/budgets
 */
export const createBudgetHandler = async (
  req: Request<{}, {}, CreateBudgetInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const budget = await createUserBudget(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Budget créé avec succès',
      data: { budget },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un budget
 * PATCH /api/budgets/:id
 */
export const updateBudgetHandler = async (
  req: Request<BudgetParams, {}, UpdateBudgetInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const budget = await updateUserBudget(req.params.id, userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Budget mis à jour avec succès',
      data: { budget },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un budget
 * DELETE /api/budgets/:id
 */
export const deleteBudgetHandler = async (
  req: Request<BudgetParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    await deleteUserBudget(req.params.id, userId);

    res.status(200).json({
      success: true,
      message: 'Budget supprimé avec succès',
    });
  } catch (error) {
    next(error);
  }
};
