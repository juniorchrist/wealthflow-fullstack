import {
  getMonthlyData,
  getCategoriesBreakdown,
  getMonthlyIncome,
  getMonthlyExpenses,
  getMonthlySavings,
  getYearlyData,
} from '../repositories/analytics.repository';
import { AnalyticsFilters } from '../validators/analytics.validator';

/**
 * Obtenir les analytics mensuelles
 */
export const getMonthlyAnalytics = async (userId: string, month?: string) => {
  const targetMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM
  return getMonthlyData(userId, targetMonth);
};

/**
 * Obtenir la répartition par catégorie
 */
export const getCategoryBreakdown = async (userId: string, filters: AnalyticsFilters) => {
  const month = filters.month || new Date().toISOString().slice(0, 7);
  const type = filters.type || 'expense';
  
  return getCategoriesBreakdown(userId, month, type);
};

/**
 * Calculer le taux d'épargne
 */
export const getSavingsRate = async (userId: string, month?: string) => {
  const targetMonth = month || new Date().toISOString().slice(0, 7);

  const [income, expenses, savings] = await Promise.all([
    getMonthlyIncome(userId, targetMonth),
    getMonthlyExpenses(userId, targetMonth),
    getMonthlySavings(userId, targetMonth),
  ]);

  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
  const expenseRate = income > 0 ? Math.round((expenses / income) * 100) : 0;

  return {
    month: targetMonth,
    income,
    expenses,
    savings,
    savingsRate,
    expenseRate,
    netSavings: income - expenses,
  };
};

/**
 * Obtenir la comparaison annuelle (12 derniers mois)
 */
export const getYearlyComparison = async (userId: string, year: number) => {
  return getYearlyData(userId, year);
};
