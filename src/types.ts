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

export interface Account {
  id: string;
  name: string;
  type: 'main' | 'card' | 'cash' | 'savings';
  initialBalance: number;
  currency: string;
  isDefault: boolean;
  icon?: string;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
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
  id?: string;
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
  createdAt?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  plan: string;
  status: 'actif' | 'inactif' | 'banni';
  role?: string;
  lastLogin: string;
  joinDate: string;
  income: number;
  expenses: number;
  savings: number;
  balance?: number;
  transactions: number;
  budgetTotal: number;
  recentTransactions?: any[];
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
  | 'security'
  | 'admin'
  | 'help-center'
  | 'legal';

export type AppRoute = 'landing' | 'app' | 'login' | 'register';

export interface SystemSettings {
  id?: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  termsOfService: string;
  privacyPolicy: string;
  supportEmail: string;
  supportPhone: string;
  updatedAt?: string;
}

export interface BanRecord {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
  reason: string;
  bannedAt: string;
  bannedBy?: string;
}

export interface SupportTicket {
  id: string;
  userId?: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  reply?: string;
  createdAt: string;
  updatedAt?: string;
}

