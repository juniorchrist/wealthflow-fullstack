import { Router } from 'express';
import { deleteAccount, exportUserData } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

export const userRoutes = Router();

userRoutes.use(authMiddleware);

userRoutes.delete('/me', deleteAccount);
userRoutes.get('/me/export', exportUserData);
