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
  { month: 'Janv.', fullMonth: 'Janvier', revenus: 2100000, depenses: 1500000, epargne: 600000 },
  { month: 'Févr.', fullMonth: 'Février', revenus: 2150000, depenses: 1450000, epargne: 700000 },
  { month: 'Mars', fullMonth: 'Mars', revenus: 2200000, depenses: 1600000, epargne: 600000 },
  { month: 'Avr.', fullMonth: 'Avril', revenus: 2100000, depenses: 1350000, epargne: 750000 },
  { month: 'Mai', fullMonth: 'Mai', revenus: 2300000, depenses: 1400000, epargne: 900000 },
  { month: 'Juin', fullMonth: 'Juin', revenus: 2250000, depenses: 1520000, epargne: 730000 },
  { month: 'Juil.', fullMonth: 'Juillet', revenus: 2400000, depenses: 1580000, epargne: 820000 },
  { month: 'Août', fullMonth: 'Août', revenus: 2300000, depenses: 1390000, epargne: 910000 },
  { month: 'Sept.', fullMonth: 'Septembre', revenus: 2350000, depenses: 1420000, epargne: 930000 },
  { month: 'Oct.', fullMonth: 'Octobre', revenus: 2380000, depenses: 1440000, epargne: 940000 },
  { month: 'Nov.', fullMonth: 'Novembre', revenus: 2450000, depenses: 1480000, epargne: 970000 },
  { month: 'Déc.', fullMonth: 'Décembre', revenus: 2600000, depenses: 1650000, epargne: 950000 },
];

export const initialNotifications: NotificationItem[] = [];
