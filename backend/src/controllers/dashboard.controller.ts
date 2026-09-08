import { Request, Response, NextFunction } from 'express';
import { getDashboardSummary } from '../services/dashboard.service';

/**
 * Obtenir le résumé du dashboard
 * GET /api/dashboard/summary
 */
export const getDashboardSummaryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const summary = await getDashboardSummary(userId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};
