export type TransactionType = 'income' | 'expense' | 'savings_deposit';

export interface Transaction {
  id: string;
  title: string;
  category: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  account: string;
  date: string; // YYYY-MM-DD or ISO
  time?: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budgetLimit: number;
  type: 'expense' | 'income';
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
  description?: string;
  isAutoSaveActive?: boolean;
  autoSaveAmount?: number;
  checkboxesCount?: number;
  checkedBoxes?: number[];
}

export interface MonthlyBudget {
  month: string; // e.g. '2026-09'
  totalBudget: number;
  categoryBudgets: Record<string, number>; // categoryId -> limit
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'alert';
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  currency: string;
  language: string;
  timezone: string;
  dateFormat: string;
  plan: string;
  pinCode: string;
  isPinEnabled: boolean;
  isLocked: boolean;
  autoLockMinutes: number;
}

export interface MonthlyChartData {
  month: string;
  fullMonth: string;
  revenus: number;
  depenses: number;
  epargne: number;
}

export type ActiveTab =
  | 'dashboard'
  | 'transactions'
  | 'budget'
  | 'savings'
  | 'analytics'
  | 'strategy'
  | 'categories'
  | 'notifications'
  | 'settings'
  | 'security';

export type AppRoute = 'landing' | 'app' | 'login' | 'register';

