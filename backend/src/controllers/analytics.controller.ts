import { Request, Response, NextFunction } from 'express';
import {
  getMonthlyAnalytics,
  getCategoryBreakdown,
  getSavingsRate,
  getYearlyComparison,
} from '../services/analytics.service';
import { AnalyticsFilters } from '../validators/analytics.validator';

/**
 * Obtenir les données mensuelles
 * GET /api/analytics/monthly
 */
export const getMonthlyAnalyticsHandler = async (
  req: Request<{}, {}, {}, AnalyticsFilters>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const data = await getMonthlyAnalytics(userId, req.query.month);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir la répartition par catégorie
 * GET /api/analytics/categories
 */
export const getCategoryBreakdownHandler = async (
  req: Request<{}, {}, {}, AnalyticsFilters>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const data = await getCategoryBreakdown(userId, req.query);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir le taux d'épargne
 * GET /api/analytics/savings-rate
 */
export const getSavingsRateHandler = async (
  req: Request<{}, {}, {}, AnalyticsFilters>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const data = await getSavingsRate(userId, req.query.month);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir la comparaison annuelle
 * GET /api/analytics/yearly
 */
export const getYearlyComparisonHandler = async (
  req: Request<{}, {}, {}, { year?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();
    const data = await getYearlyComparison(userId, year);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
