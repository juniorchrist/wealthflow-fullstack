/**
 * Client API pour communiquer avec le backend WealthFlow (Render / Local)
 */

// Récupérer l'URL du backend depuis les variables d'environnement Vite
// Priorité: VITE_API_URL > VITE_BACKEND_URL > https://wealthflow-fullstack-2.onrender.com/api
const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_BACKEND_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  return 'https://wealthflow-fullstack-2.onrender.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Gestion des tokens JWT
const TOKEN_KEY = 'wf_auth_token';
const REFRESH_TOKEN_KEY = 'wf_refresh_token';
const ADMIN_TOKEN_KEY = 'wf_admin_auth_token';
const ADMIN_REFRESH_TOKEN_KEY = 'wf_admin_refresh_token';

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

export const getAdminAuthToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminAuthToken = (token: string, refreshToken?: string): void => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  if (refreshToken) {
    localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearAdminAuthToken = (): void => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
};

// Fonction de connexion admin de secours transparente
async function tryAdminLogin(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin', password: 'wealthflow2026' }),
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const tokens = data.data?.tokens || data.tokens;
      if (tokens?.accessToken) {
        setAdminAuthToken(tokens.accessToken, tokens.refreshToken);
        return true;
      }
    }
  } catch (err) {
    console.warn('[WealthFlow API] Échec de l\'auto-connexion admin:', err);
  }
  return false;
}

// Fonction générique pour effectuer des requêtes API
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount: number = 0
): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const isAdminRoute = endpoint.startsWith('/admin') && !endpoint.startsWith('/admin/login');
  
  // Si c'est une route admin et qu'aucun token admin n'existe, tenter de se connecter automatiquement
  if (isAdminRoute && !getAdminAuthToken()) {
    await tryAdminLogin();
  }

  const token = isAdminRoute ? (getAdminAuthToken() || getAuthToken()) : getAuthToken();
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
      // 1. Si route admin et 401, rafraîchir le token admin et réessayer
      if (isAdminRoute && response.status === 401 && retryCount < 2) {
        const adminRefreshed = await tryAdminLogin();
        if (adminRefreshed) {
          const newAdminToken = getAdminAuthToken();
          if (newAdminToken) {
            headers['Authorization'] = `Bearer ${newAdminToken}`;
            const retryRes = await fetch(url, { ...options, headers });
            const retryData = await retryRes.json().catch(() => ({}));
            if (retryRes.ok) {
              return {
                success: true,
                data: retryData.data || retryData,
                message: retryData.message,
              };
            }
          }
        }
      }

      // 2. Si non autorisé utilisateur normal (token expiré), tenter un refresh
      if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh') && !isAdminRoute) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
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

      let errorMsg = result.message || `Erreur HTTP ${response.status}`;
      if (result.errors && typeof result.errors === 'object') {
        const fieldErrors = Object.values(result.errors).flat().filter(Boolean);
        if (fieldErrors.length > 0) {
          errorMsg = fieldErrors.join(', ');
        }
      }

      return {
        success: false,
        message: errorMsg,
        error: result,
      };
    }

    return {
      success: true,
      data: result.data || result,
      message: result.message,
    };
  } catch (error: any) {
    const errMsg = String(error?.message || error || '');
    const isNetworkOrFetchError =
      error?.name === 'TypeError' ||
      errMsg.toLowerCase().includes('fetch') ||
      errMsg.toLowerCase().includes('network') ||
      errMsg.toLowerCase().includes('load');

    // Réessayer automatiquement 1 fois après 1.5s si c'est un réveil de serveur Render
    if (isNetworkOrFetchError && retryCount < 1) {
      console.info(`[WealthFlow API] Nouvelle tentative pour ${endpoint} dans 1.5s...`);
      await new Promise((r) => setTimeout(r, 1500));
      return apiRequest<T>(endpoint, options, retryCount + 1);
    }

    console.warn(`[WealthFlow API] Erreur lors de l'appel à ${endpoint}:`, error.message);
    const userMessage = isNetworkOrFetchError
      ? 'Le serveur Render est en cours de réveil ou inaccessible. Veuillez patienter 15 secondes et réessayer.'
      : (error.message || 'Impossible de joindre le serveur');

    return {
      success: false,
      message: userMessage,
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
      return apiRequest<any>('/savings-goals');
    },

    create: async (payload: { title: string; targetAmount: number; deadline: string; icon: string; color: string; description?: string }) => {
      return apiRequest<any>('/savings-goals', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    update: async (id: string, payload: any) => {
      return apiRequest<any>(`/savings-goals/${id}`, {
        method: 'PATCH',
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

  // Accounts
  accounts: {
    getAll: async () => {
      return apiRequest<any[]>('/accounts');
    },

    create: async (payload: { 
      name: string; 
      type?: 'main' | 'card' | 'cash' | 'savings'; 
      initialBalance?: number; 
      currency?: string; 
      icon?: string; 
      color?: string;
      isDefault?: boolean;
    }) => {
      return apiRequest<any>('/accounts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    update: async (id: string, payload: any) => {
      return apiRequest<any>(`/accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    delete: async (id: string) => {
      return apiRequest<any>(`/accounts/${id}`, {
        method: 'DELETE',
      });
    },

    setDefault: async (id: string) => {
      return apiRequest<any>(`/accounts/${id}/default`, {
        method: 'PATCH',
      });
    },
  },

  // Paramètres système globaux (publics)
  system: {
    getSettings: async () => {
      return apiRequest<any>('/system/settings');
    },
  },

  // Centre d'aide et support
  support: {
    createTicket: async (data: {
      name: string;
      email: string;
      subject: string;
      category: string;
      message: string;
      userId?: string;
    }) => {
      return apiRequest<any>('/support/tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    checkBan: async (email: string) => {
      return apiRequest<any>(`/support/ban-status?email=${encodeURIComponent(email)}`);
    },
  },

  // Admin
  admin: {
    login: async (payload: { identifier: string; password: string }) => {
      const res = await apiRequest<any>('/admin/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const tokens = res.data?.tokens || res.data?.data?.tokens || (res as any)?.tokens;
      if (res.success && tokens?.accessToken) {
        setAdminAuthToken(tokens.accessToken, tokens.refreshToken);
      }
      return res;
    },

    getAdminToken: getAdminAuthToken,
    setAdminToken: setAdminAuthToken,
    clearAdminToken: clearAdminAuthToken,

    getUsers: async () => {
      return apiRequest<any[]>('/admin/users');
    },

    deleteUser: async (id: string, reason?: string, email?: string) => {
      return apiRequest<any>(`/admin/users/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason, email }),
      });
    },

    banUser: async (payload: { email: string; reason?: string; nom?: string; prenom?: string; deleteAccount?: boolean }) => {
      return apiRequest<any>('/admin/bans', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    broadcastNotification: async (payload: { title: string; message: string; type?: string; targetUserId?: string }) => {
      return apiRequest<any>('/admin/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    getBans: async () => {
      return apiRequest<any[]>('/admin/bans');
    },

    removeBan: async (id: string) => {
      return apiRequest<any>(`/admin/bans/${id}`, {
        method: 'DELETE',
      });
    },

    getTickets: async () => {
      return apiRequest<any[]>('/admin/support/tickets');
    },

    updateTicket: async (id: string, status?: string, reply?: string) => {
      return apiRequest<any>(`/admin/support/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reply }),
      });
    },

    updateSettings: async (settings: any) => {
      return apiRequest<any>('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    },

    purgeCache: async () => {
      return apiRequest<any>('/admin/maintenance/cache-clear', {
        method: 'POST',
      });
    },
  },
};
