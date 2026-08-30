import { Router } from 'express';
import {
  getSavingsGoals,
  getSavingsGoalById,
  createSavingsGoal,
  updateSavingsGoal,
  contributeSavings,
  deleteSavingsGoal,
} from '../controllers/savingsController';
import { authMiddleware } from '../middleware/auth';

export const savingsRoutes = Router();

savingsRoutes.use(authMiddleware);

savingsRoutes.get('/', getSavingsGoals);
savingsRoutes.get('/:id', getSavingsGoalById);
savingsRoutes.post('/', createSavingsGoal);
savingsRoutes.put('/:id', updateSavingsGoal);
savingsRoutes.post('/:id/contribute', contributeSavings);
savingsRoutes.delete('/:id', deleteSavingsGoal);
