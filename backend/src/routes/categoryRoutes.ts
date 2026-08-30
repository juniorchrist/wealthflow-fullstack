import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authMiddleware } from '../middleware/auth';

export const categoryRoutes = Router();

categoryRoutes.use(authMiddleware);

categoryRoutes.get('/', getCategories);
categoryRoutes.post('/', createCategory);
categoryRoutes.put('/:id', updateCategory);
categoryRoutes.delete('/:id', deleteCategory);
