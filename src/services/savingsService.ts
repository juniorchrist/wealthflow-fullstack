import { api } from './api';
import { SavingsGoal } from '../types';

export const savingsService = {
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    return api.get<SavingsGoal[]>('/savings-goals');
  },

  async getSavingsGoalById(id: string): Promise<SavingsGoal> {
    return api.get<SavingsGoal>(`/savings-goals/${id}`);
  },

  async createSavingsGoal(goal: Omit<SavingsGoal, 'createdAt'> & { id?: string }): Promise<SavingsGoal> {
    return api.post<SavingsGoal>('/savings-goals', goal);
  },

  async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal> {
    return api.put<SavingsGoal>(`/savings-goals/${id}`, updates);
  },

  async contributeSavings(id: string, amount: number, milestoneId?: string): Promise<SavingsGoal> {
    return api.post<SavingsGoal>(`/savings-goals/${id}/contribute`, { amount, milestoneId });
  },

  async deleteSavingsGoal(id: string): Promise<{ message: string; id: string }> {
    return api.delete<{ message: string; id: string }>(`/savings-goals/${id}`);
  },
};
