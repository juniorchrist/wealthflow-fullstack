import { Category, MonthlyChartData, NotificationItem, SavingsGoal, Transaction, UserProfile } from '../types';

export const initialUserProfile: UserProfile = {
  name: '',
  email: '',
  phone: '',
  avatar: '',
  currency: 'FCFA',
  language: 'Français',
  timezone: 'GMT +00:00',
  dateFormat: 'DD/MM/YYYY',
  plan: 'WealthFlow Pro',
  pinCode: '',
  isPinEnabled: false,
  isLocked: false,
  autoLockMinutes: 15,
};

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Alimentation', icon: 'Utensils', color: '#FF5330', budgetLimit: 0, type: 'expense' },
  { id: 'cat-2', name: 'Transport', icon: 'Car', color: '#F97316', budgetLimit: 0, type: 'expense' },
  { id: 'cat-3', name: 'Logement & Charges', icon: 'Home', color: '#6366F1', budgetLimit: 0, type: 'expense' },
  { id: 'cat-4', name: 'Divertissement', icon: 'Film', color: '#EC4899', budgetLimit: 0, type: 'expense' },
  { id: 'cat-5', name: 'Santé & Bien-être', icon: 'HeartPulse', color: '#10B981', budgetLimit: 0, type: 'expense' },
  { id: 'cat-6', name: 'Épargne & Investissement', icon: 'PiggyBank', color: '#FF5330', budgetLimit: 0, type: 'expense' },
  { id: 'cat-7', name: 'Shopping & Perso', icon: 'ShoppingBag', color: '#8B5CF6', budgetLimit: 0, type: 'expense' },
  { id: 'cat-8', name: 'Salaire & Revenus', icon: 'Wallet', color: '#10B981', budgetLimit: 0, type: 'income' },
  { id: 'cat-9', name: 'Freelance & Business', icon: 'Briefcase', color: '#3B82F6', budgetLimit: 0, type: 'income' },
];

export const initialTransactions: Transaction[] = [];

export const initialSavingsGoals: SavingsGoal[] = [];

export const initialChartData: MonthlyChartData[] = [
  { month: 'Janv.', fullMonth: 'Janvier', revenus: 0, depenses: 0, epargne: 0 },
  { month: 'Févr.', fullMonth: 'Février', revenus: 0, depenses: 0, epargne: 0 },
  { month: 'Mars', fullMonth: 'Mars', revenus: 0, depenses: 0, epargne: 0 },
  { month: 'Avr.', fullMonth: 'Avril', revenus: 0, depenses: 0, epargne: 0 },
  { month: 'Mai', fullMonth: 'Mai', revenus: 0, depenses: 0, epargne: 0 },
  { month: 'Juin', fullMonth: 'Juin', revenus: 0, depenses: 0, epargne: 0 },
  { month: 'Juil.', fullMonth: 'Juillet', revenus: 0, depenses: 0, epargne: 0 },
  { month: 'Août', fullMonth: 'Août', revenus: 0, depenses: 0, epargne: 0 },
  { month: 'Sept.', fullMonth: 'Septembre', revenus: 0, depenses: 0, epargne: 0 },
  { month: 'Oct.', fullMonth: 'Octobre', revenus: 0, depenses: 0, epargne: 0 },
  { month: 'Nov.', fullMonth: 'Novembre', revenus: 0, depenses: 0, epargne: 0 },
  { month: 'Déc.', fullMonth: 'Décembre', revenus: 0, depenses: 0, epargne: 0 },
];

export const initialNotifications: NotificationItem[] = [];
