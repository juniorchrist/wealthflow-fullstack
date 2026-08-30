import { api } from './api';
import { Transaction } from '../types';

export const transactionService = {
  async getTransactions(filters?: { month?: string; categoryId?: string; type?: string }): Promise<Transaction[]> {
    return api.get<Transaction[]>('/transactions', filters);
  },

  async getTransactionById(id: string): Promise<Transaction> {
    return api.get<Transaction>(`/transactions/${id}`);
  },

  async createTransaction(tx: Omit<Transaction, 'createdAt'> & { id?: string }): Promise<Transaction> {
    return api.post<Transaction>('/transactions', tx);
  },

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    return api.put<Transaction>(`/transactions/${id}`, updates);
  },

  async deleteTransaction(id: string): Promise<{ message: string; id: string }> {
    return api.delete<{ message: string; id: string }>(`/transactions/${id}`);
  },
};
