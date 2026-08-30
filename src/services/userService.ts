import { api } from './api';
import { getTodayDateString } from '../utils/formatters';

export const userService = {
  async deleteAccount(): Promise<{ message: string }> {
    return api.delete<{ message: string }>('/users/me');
  },

  async exportUserData(): Promise<any> {
    const data = await api.get<any>('/users/me/export');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const today = getTodayDateString();
    downloadAnchor.setAttribute('download', `wealthflow_cloud_backup_${today}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    return data;
  },
};
