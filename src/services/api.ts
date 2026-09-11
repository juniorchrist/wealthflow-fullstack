/**
 * Client API pour communiquer avec le backend WealthFlow (Render / Local)
 */

// Récupérer l'URL du backend depuis les variables d'environnement Vite
// Priorité: VITE_API_URL > VITE_BACKEND_URL > https://wealthflow-fullstack-2.onrender.com/api
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  return 'https://wealthflow-fullstack-2.onrender.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Gestion des tokens JWT
const TOKEN_KEY = 'wf_auth_token';
const REFRESH_TOKEN_KEY = 'wf_refresh_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string, refreshToken?: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearAuthTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Fonction générique pour effectuer des requêtes API
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Si non autorisé (token expiré), tenter un refresh
      if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          // Réessayer la requête originale avec le nouveau token
          const newToken = getAuthToken();
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            const retryRes = await fetch(url, { ...options, headers });
            const retryData = await retryRes.json().catch(() => ({}));
            if (retryRes.ok) {
              return { success: true, data: retryData.data || retryData };
            }
          }
        }
      }

      return {
        success: false,
        message: result.message || `Erreur HTTP ${response.status}`,
        error: result,
      };
    }

    return {
      success: true,
      data: result.data || result,
      message: result.message,
    };
  } catch (error: any) {
    console.warn(`[WealthFlow API] Erreur lors de l'appel à ${endpoint}:`, error.message);
    return {
      success: false,
      message: error.message || 'Impossible de joindre le serveur',
      error,
    };
  }
}

// Tentative de rafraîchissement du token
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data?.accessToken) {
        setAuthToken(data.data.accessToken, data.data.refreshToken);
        return true;
      }
    }
  } catch (err) {
    console.warn('[WealthFlow API] Échec du refresh token:', err);
  }

  clearAuthTokens();
  return false;
}

// ============================================================================
// SERVICES API WEALTHFLOW
// ============================================================================

export const api = {
  // Health check
  health: async () => {
    return apiRequest<{ status: string; database: string }>('/health');
  },

  // Auth
  auth: {
    register: async (payload: { email: string; password: string; nom: string; prenom: string; numero?: string; currency?: string }) => {
      const res = await apiRequest<{ user: any; tokens: { accessToken: string; refreshToken: string } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.success && res.data?.tokens) {
        setAuthToken(res.data.tokens.accessToken, res.data.tokens.refreshToken);
      }
      return res;
    },

    login: async (payload: { email: string; password: string }) => {
      const res = await apiRequest<{ user: any; tokens: { accessToken: string; refreshToken: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.success && res.data?.tokens) {
        setAuthToken(res.data.tokens.accessToken, res.data.tokens.refreshToken);
      }
      return res;
    },

    me: async () => {
      return apiRequest<any>('/auth/me');
    },

    logout: async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
      clearAuthTokens();
    },
  },

  // Transactions
  transactions: {
    getAll: async (params?: { page?: number; limit?: number; type?: string; categoryId?: string; startDate?: string; endDate?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return apiRequest<any>(`/transactions${query ? `?${query}` : ''}`);
    },

    create: async (payload: { title: string; amount: number; type: string; categoryId: string; date: string; time?: string; notes?: string }) => {
      return apiRequest<any>('/transactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    update: async (id: string, payload: any) => {
      return apiRequest<any>(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    delete: async (id: string) => {
      return apiRequest<any>(`/transactions/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Categories
  categories: {
    getAll: async () => {
      return apiRequest<any[]>('/categories');
    },

    create: async (payload: { name: string; icon: string; color: string; budgetLimit?: number; type: 'expense' | 'income' }) => {
      return apiRequest<any>('/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    update: async (id: string, payload: any) => {
      return apiRequest<any>(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    delete: async (id: string) => {
      return apiRequest<any>(`/categories/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Savings Goals
  savings: {
    getAll: async () => {
      return apiRequest<any[]>('/savings-goals');
    },

    create: async (payload: { title: string; targetAmount: number; deadline: string; icon: string; color: string; description?: string }) => {
      return apiRequest<any>('/savings-goals', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    update: async (id: string, payload: any) => {
      return apiRequest<any>(`/savings-goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    delete: async (id: string) => {
      return apiRequest<any>(`/savings-goals/${id}`, {
        method: 'DELETE',
      });
    },

    deposit: async (goalId: string, payload: { amount: number; date?: string; notes?: string }) => {
      return apiRequest<any>(`/savings-goals/${goalId}/deposits`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  // Dashboard
  dashboard: {
    getSummary: async () => {
      return apiRequest<any>('/dashboard/summary');
    },
  },

  // Notifications
  notifications: {
    getAll: async () => {
      return apiRequest<any[]>('/notifications');
    },

    markRead: async (id: string) => {
      return apiRequest<any>(`/notifications/${id}/read`, {
        method: 'PATCH',
      });
    },

    markAllRead: async () => {
      return apiRequest<any>('/notifications/read-all', {
        method: 'PATCH',
      });
    },

    delete: async (id: string) => {
      return apiRequest<any>(`/notifications/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Settings
  settings: {
    get: async () => {
      return apiRequest<any>('/settings');
    },

    update: async (payload: any) => {
      return apiRequest<any>('/settings', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },

    setupPin: async (pin: string) => {
      return apiRequest<any>('/settings/pin', {
        method: 'POST',
        body: JSON.stringify({ pin }),
      });
    },

    verifyPin: async (pin: string) => {
      return apiRequest<{ verified: boolean }>('/settings/pin/verify', {
        method: 'POST',
        body: JSON.stringify({ pin }),
      });
    },

    disablePin: async () => {
      return apiRequest<any>('/settings/pin/disable', {
        method: 'POST',
      });
    },
  },
};
