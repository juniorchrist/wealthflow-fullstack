export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'expense' | 'income' | 'both';
  isDefault?: boolean;
  isActive?: boolean;
}

export interface Transaction {
  id: string;
  amount: number; // in FCFA
  type: TransactionType;
  categoryId: string;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: number;
}

export interface MonthlyBudget {
  month: string; // YYYY-MM
  totalBudget: number; // in FCFA
  savingsTarget?: number; // in FCFA
  categoryBudgets?: Record<string, number>; // categoryId -> limit in FCFA
  createdAt: number;
  updatedAt: number;
}

export interface SavingsMilestone {
  id: string;
  title: string; // ex: "Semaine 1", "Échéance 1"
  targetAmount: number;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface SavingsGoal {
  id: string;
  month: string; // YYYY-MM or 'global'
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category?: string;
  milestones: SavingsMilestone[];
  createdAt: number;
}

export type DataTypeTag = 'real' | 'calculated' | 'estimate';

export interface ExpenseOptimizationItem {
  id: string;
  categoryName: string;
  currentMonthlySpend: number;
  reductionPercentage: number; // e.g. 15 (%)
  monthlySavings: number;
  annualSavings: number;
  tip: string;
  impactLevel: 'high' | 'medium' | 'low';
}

export interface InvestmentProduct {
  id: string;
  name: string;
  type: 'security' | 'bonds' | 'funds' | 'stocks' | 'real_estate';
  riskLevel: 'faible' | 'modéré' | 'dynamique';
  expectedReturnMin: number; // e.g. 5.5 (%)
  expectedReturnMax: number; // e.g. 7.5 (%)
  minimumDeposit: number; // in FCFA
  liquidity: string; // ex: "Disponible sous 48h", "Bloqué 1 an", "Marché secondaire"
  description: string;
  suitability: string;
  providerExamples: string;
}

export interface AllocationSlice {
  title: string;
  percentage: number;
  color: string;
  description: string;
  suggestedMonthlyAmount: number;
}

export interface AllocationProfile {
  id: 'prudent' | 'equilibre' | 'dynamique';
  name: string;
  description: string;
  horizon: string;
  expectedAnnualReturn: number; // e.g. 6.5 (%)
  slices: AllocationSlice[];
}

export interface Insight {
  id: string;
  type: 'alert' | 'recommendation' | 'positive' | 'warning' | 'info';
  title: string;
  description: string;
  source: string; // Explanation of the calculation or data source
  amount?: number;
  tag: DataTypeTag;
  actionType?: 'add_budget' | 'add_savings' | 'view_category' | 'view_analytics';
  targetCategoryId?: string;
}

export interface MonthSummary {
  month: string;
  budget: number;
  hasBudget: boolean;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  remainingBudget: number;
  budgetUsagePercent: number;
  savingsCapacity: number;
  totalSaved: number;
  dailyAverage: number;
  maxExpense: Transaction | null;
  dominantCategory: { category: Category | null; amount: number; percentage: number } | null;
}

export interface AppFilter {
  search: string;
  month: string;
  categoryId: string;
  type: 'all' | 'expense' | 'income';
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
}

export interface UserProfile {
  id: string;
  nom: string;
  prenom: string;
  numero: string;
  email: string;
  mdp: string; // Uniquement des chiffres
  registeredAt: number;
}

export type NotificationType =
  | 'budget'
  | 'transaction'
  | 'savings'
  | 'strategy'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  source?: string; // data behind the notification (for "why")
  createdAt: number;
  read: boolean;
  tab?: string; // destination tab when tapped
  amount?: number;
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Record<string, MonthlyBudget>; // key: YYYY-MM
  savingsGoals: SavingsGoal[];
  notifications: AppNotification[];
  theme: 'light' | 'dark' | 'system';
  userProfile?: UserProfile;
}

