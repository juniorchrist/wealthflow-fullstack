/**
 * Types pour les réponses API
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Types pour les requêtes
 */

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}
