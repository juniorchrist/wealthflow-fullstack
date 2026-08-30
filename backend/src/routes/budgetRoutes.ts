import { Router } from 'express';
import {
  getBudgets,
  getBudgetByMonth,
  upsertBudget,
  deleteBudget,
} from '../controllers/budgetController';
import { authMiddleware } from '../middleware/auth';

export const budgetRoutes = Router();

budgetRoutes.use(authMiddleware);

budgetRoutes.get('/', getBudgets);
budgetRoutes.get('/:month', getBudgetByMonth);
budgetRoutes.post('/', upsertBudget);
budgetRoutes.put('/:month', upsertBudget);
budgetRoutes.delete('/:month', deleteBudget);
