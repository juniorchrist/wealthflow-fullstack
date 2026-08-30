import { api, setAuthToken, removeAuthToken, getAuthToken } from './api';
import { UserProfile } from '../types';

export interface RegisterPayload {
  nom: string;
  prenom: string;
  numero: string;
  email: string;
  password: string;
  pin?: string;
}

export interface LoginPayload {
  identifier: string; // email or numero
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: UserProfile;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>('/auth/register', payload);
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>('/auth/login', payload);
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async getMe(): Promise<{ user: UserProfile; settings?: any }> {
    return api.get<{ user: UserProfile; settings?: any }>('/auth/me');
  },

  async updateProfile(payload: Partial<UserProfile>): Promise<{ message: string; user: UserProfile }> {
    return api.put<{ message: string; user: UserProfile }>('/auth/profile', payload);
  },

  async updatePin(newPin: string, oldPin?: string): Promise<{ message: string }> {
    return api.put<{ message: string }>('/auth/pin', { newPin, oldPin });
  },

  async verifyPin(pin: string): Promise<{ valid: boolean; error?: string }> {
    return api.post<{ valid: boolean; error?: string }>('/auth/verify-pin', { pin });
  },

  async logout(): Promise<void> {
    try {
      if (getAuthToken()) {
        await api.post('/auth/logout');
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      removeAuthToken();
    }
  },

  isAuthenticated(): boolean {
    return !!getAuthToken();
  },
};
