import { api } from './api';

export interface UserSettingsData {
  id?: string;
  userId?: string;
  theme: string;
  currency: string;
  securityLockEnabled: boolean;
}

export const settingsService = {
  async getSettings(): Promise<UserSettingsData> {
    return api.get<UserSettingsData>('/settings');
  },

  async updateSettings(settings: Partial<UserSettingsData>): Promise<UserSettingsData> {
    return api.put<UserSettingsData>('/settings', settings);
  },
};
