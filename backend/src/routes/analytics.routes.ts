import { Router } from 'express';
import {
  getMonthlyAnalyticsHandler,
  getCategoryBreakdownHandler,
  getSavingsRateHandler,
  getYearlyComparisonHandler,
} from '../controllers/analytics.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(requireAuth);

/**
 * @route   GET /api/analytics/monthly
 * @desc    Obtenir les données mensuelles
 * @access  Private
 */
router.get('/monthly', getMonthlyAnalyticsHandler as any);

/**
 * @route   GET /api/analytics/categories
 * @desc    Répartition par catégorie
 * @access  Private
 */
router.get('/categories', getCategoryBreakdownHandler as any);

/**
 * @route   GET /api/analytics/savings-rate
 * @desc    Taux d'épargne
 * @access  Private
 */
router.get('/savings-rate', getSavingsRateHandler as any);

/**
 * @route   GET /api/analytics/yearly
 * @desc    Comparaison annuelle (12 mois)
 * @access  Private
 */
router.get('/yearly', getYearlyComparisonHandler as any);

export default router;
