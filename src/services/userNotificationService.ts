import { api } from './api';
import { AppNotification } from '../types';

export const userNotificationService = {
  async getNotifications(): Promise<AppNotification[]> {
    return api.get<AppNotification[]>('/notifications');
  },

  async markAsRead(id: string): Promise<{ id: string; read: boolean }> {
    return api.put<{ id: string; read: boolean }>(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<{ message: string }> {
    return api.put<{ message: string }>('/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<{ message: string; id: string }> {
    return api.delete<{ message: string; id: string }>(`/notifications/${id}`);
  },
};
