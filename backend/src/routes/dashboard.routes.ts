import { Router } from 'express';
import { getDashboardSummaryHandler } from '../controllers/dashboard.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(requireAuth);

/**
 * @route   GET /api/dashboard/summary
 * @desc    Obtenir le résumé du dashboard
 * @access  Private
 */
router.get('/summary', getDashboardSummaryHandler);

export default router;
