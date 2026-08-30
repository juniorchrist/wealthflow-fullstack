import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { authMiddleware } from '../middleware/auth';

export const settingsRoutes = Router();

settingsRoutes.use(authMiddleware);

settingsRoutes.get('/', getSettings);
settingsRoutes.put('/', updateSettings);
