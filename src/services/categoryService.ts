import { api } from './api';
import { Category } from '../types';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    return api.get<Category[]>('/categories');
  },

  async createCategory(category: Omit<Category, 'id' | 'isDefault' | 'isActive'> & { id?: string }): Promise<Category> {
    return api.post<Category>('/categories', category);
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    return api.put<Category>(`/categories/${id}`, updates);
  },

  async deleteCategory(id: string): Promise<{ message: string; id: string }> {
    return api.delete<{ message: string; id: string }>(`/categories/${id}`);
  },
};
