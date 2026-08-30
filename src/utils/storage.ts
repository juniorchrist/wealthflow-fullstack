import { AppState, Category, MonthlyBudget, SavingsGoal, Transaction, UserProfile } from '../types';
import { DEFAULT_CATEGORIES } from './constants';
import { getCurrentMonthKey, getAdjacentMonth, getTodayDateString } from './formatters';

const USER_PROFILE_KEY = 'wealthflow_user_profile_v1';
const STORAGE_KEY = 'wealthflow_state_v1';

export function getUserProfileFromStorage(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
  }
  return null;
}

export function saveUserProfileToStorage(profile: UserProfile): void {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

export function removeUserProfileFromStorage(): void {
  try {
    localStorage.removeItem(USER_PROFILE_KEY);
  } catch (error) {
    console.error('Error removing user profile:', error);
  }
}

export function generateDemoState(): AppState {
  const currentMonth = getCurrentMonthKey();
  const prevMonth = getAdjacentMonth(currentMonth, -1);
  const [currY, currM] = currentMonth.split('-');
  const [prevY, prevM] = prevMonth.split('-');

  const sampleBudgets: Record<string, MonthlyBudget> = {
    [currentMonth]: {
      month: currentMonth,
      totalBudget: 180000,
      savingsTarget: 50000,
      createdAt: Date.now() - 86400000 * 15,
      updatedAt: Date.now(),
    },
    [prevMonth]: {
      month: prevMonth,
      totalBudget: 175000,
      savingsTarget: 40000,
      createdAt: Date.now() - 86400000 * 45,
      updatedAt: Date.now() - 86400000 * 30,
    },
  };

  const sampleTransactions: Transaction[] = [
    // Income
    {
      id: 'tx-demo-inc-1',
      amount: 450000,
      type: 'income',
      categoryId: 'cat-business',
      date: `${currY}-${currM}-01`,
      note: 'Dividend Credit',
      createdAt: Date.now() - 86400000 * 1,
    },
    // Recent disbursements matching screenshots
    {
      id: 'tx-demo-exp-1',
      amount: 85000,
      type: 'expense',
      categoryId: 'cat-alimentation',
      date: `${currY}-${currM}-05`,
      note: 'Le Cinq Dining',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'tx-demo-exp-2',
      amount: 32000,
      type: 'expense',
      categoryId: 'cat-transport',
      date: `${currY}-${currM}-04`,
      note: 'Emirates First Class',
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'tx-demo-exp-3',
      amount: 4500,
      type: 'expense',
      categoryId: 'cat-shopping',
      date: `${currY}-${currM}-03`,
      note: 'Boutique Purchase',
      createdAt: Date.now() - 86400000 * 4,
    },
    {
      id: 'tx-demo-exp-4',
      amount: 4500,
      type: 'expense',
      categoryId: 'cat-alimentation',
      date: `${currY}-${currM}-06`,
      note: 'Artisan Coffee',
      createdAt: Date.now() - 86400000 * 1,
    },
  ];

  const sampleSavingsGoals: SavingsGoal[] = [
    {
      id: 'goal-demo-1',
      month: currentMonth,
      title: "Tirelire d'Épargne",
      targetAmount: 50000,
      currentAmount: 20000,
      category: 'cat-epargne-transfert',
      createdAt: Date.now() - 86400000 * 14,
      milestones: [
        {
          id: 'box-1',
          title: 'Case 1',
          targetAmount: 10000,
          isCompleted: true,
          completedAt: `${currY}-${currM}-05`,
        },
        {
          id: 'box-2',
          title: 'Case 2',
          targetAmount: 10000,
          isCompleted: true,
          completedAt: `${currY}-${currM}-12`,
        },
        {
          id: 'box-3',
          title: 'Case 3',
          targetAmount: 10000,
          isCompleted: false,
          completedAt: null,
        },
        {
          id: 'box-4',
          title: 'Case 4',
          targetAmount: 10000,
          isCompleted: false,
          completedAt: null,
        },
        {
          id: 'box-5',
          title: 'Case 5',
          targetAmount: 10000,
          isCompleted: false,
          completedAt: null,
        },
      ],
    },
  ];

  return {
    transactions: sampleTransactions,
    categories: DEFAULT_CATEGORIES,
    budgets: sampleBudgets,
    savingsGoals: sampleSavingsGoals,
    notifications: [],
    theme: 'light',
  };
}

export function saveStateToStorage(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (state.userProfile) {
      saveUserProfileToStorage(state.userProfile);
    }
  } catch (error) {
    console.error('Error saving state to localStorage:', error);
  }
}

export function getInitialState(): AppState {
  const profile = getUserProfileFromStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        categories: Array.isArray(parsed.categories) && parsed.categories.length > 0
          ? parsed.categories
          : DEFAULT_CATEGORIES,
        budgets: parsed.budgets && typeof parsed.budgets === 'object' ? parsed.budgets : {},
        savingsGoals: Array.isArray(parsed.savingsGoals) ? parsed.savingsGoals : [],
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
        theme: parsed.theme === 'dark' ? 'light' : (parsed.theme || 'light'),
        userProfile: profile || parsed.userProfile || undefined,
      };
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
  }

  // Pre-seed with beautiful realistic WealthFlow dataset
  const base = generateDemoState();
  return {
    ...base,
    userProfile: profile || undefined,
  };
}

/**
 * Export data as JSON file
 */
export function exportToJSON(state: AppState): void {
  const exportPayload = {
    app: 'WealthFlow',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: state,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const today = getTodayDateString();
  downloadAnchor.setAttribute('download', `wealthflow_backup_${today}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Export transactions as CSV file
 */
export function exportToCSV(transactions: Transaction[], categories: Category[]): void {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  
  const headers = ['ID', 'Date', 'Type', 'Catégorie', 'Montant (FCFA)', 'Description / Note'];
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    t.type === 'expense' ? 'Dépense' : 'Revenu',
    `"${(categoryMap.get(t.categoryId) || 'Non catégorisé').replace(/"/g, '""')}"`,
    t.amount,
    `"${(t.note || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', `wealthflow_transactions_${getTodayDateString()}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Parse & validate JSON import file
 */
export function parseImportJSON(fileContent: string): { success: boolean; data?: AppState; error?: string } {
  try {
    const parsed = JSON.parse(fileContent);
    const stateData = parsed.data || parsed;

    if (!stateData || typeof stateData !== 'object') {
      return { success: false, error: 'Structure de fichier invalide.' };
    }

    const validatedTransactions = Array.isArray(stateData.transactions) ? stateData.transactions : [];
    const validatedCategories = Array.isArray(stateData.categories) && stateData.categories.length > 0
      ? stateData.categories
      : DEFAULT_CATEGORIES;
    const validatedBudgets = stateData.budgets && typeof stateData.budgets === 'object' ? stateData.budgets : {};
    const validatedSavingsGoals = Array.isArray(stateData.savingsGoals) ? stateData.savingsGoals : [];

    return {
      success: true,
      data: {
        transactions: validatedTransactions,
        categories: validatedCategories,
        budgets: validatedBudgets,
        savingsGoals: validatedSavingsGoals,
        notifications: Array.isArray(stateData.notifications) ? stateData.notifications : [],
        theme: stateData.theme || 'system',
      },
    };
  } catch (err) {
    return { success: false, error: 'Impossible de lire le fichier JSON. Vérifiez son format.' };
  }
}
