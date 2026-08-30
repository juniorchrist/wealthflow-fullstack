import { api } from './api';
import { MonthlyBudget } from '../types';

export const budgetService = {
  async getBudgets(): Promise<Record<string, MonthlyBudget>> {
    return api.get<Record<string, MonthlyBudget>>('/budgets');
  },

  async getBudgetByMonth(month: string): Promise<MonthlyBudget> {
    return api.get<MonthlyBudget>(`/budgets/${month}`);
  },

  async upsertBudget(budget: {
    month: string;
    totalBudget: number;
    savingsTarget?: number;
    categoryBudgets?: Record<string, number>;
  }): Promise<MonthlyBudget> {
    return api.post<MonthlyBudget>('/budgets', budget);
  },

  async deleteBudget(month: string): Promise<{ message: string; month: string }> {
    return api.delete<{ message: string; month: string }>(`/budgets/${month}`);
  },
};
