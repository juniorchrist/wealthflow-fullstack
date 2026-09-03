import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  initialCategories,
  initialChartData,
  initialNotifications,
  initialSavingsGoals,
  initialTransactions,
  initialUserProfile,
} from '../data/initialData';
import { ActiveTab, AppRoute, Category, MonthlyChartData, NotificationItem, SavingsGoal, Transaction, UserProfile } from '../types';

interface WealthContextType {
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  previousTab: ActiveTab;

  // Session & Public/Private Routing
  isAuthenticated: boolean;
  currentRoute: AppRoute;
  setCurrentRoute: (route: AppRoute) => void;
  login: (credentials?: { email?: string; name?: string }) => void;
  registerUser: (data: { name: string; email: string; currency: string }) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Savings Goals
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;
  toggleGoalCheckbox: (goalId: string, boxIndex: number) => void;
  toggleGoalAutoSave: (goalId: string) => void;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;

  // Chart data
  chartData: MonthlyChartData[];

  // Security / PIN
  isLocked: boolean;
  unlockWithPin: (pin: string) => boolean;
  lockApp: () => void;
  changePin: (oldPin: string, newPin: string) => boolean;

  // Loading Screen State & Controller
  isLoading: boolean;
  loadingMessage: string;
  simulateLoading: (durationMs?: number, customMessage?: string) => void;
  finishLoading: () => void;

  // Financial Computations
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSaved: number;
  monthlyBudgetTotal: number;
  monthlyBudgetSpent: number;
  monthlyBudgetRemaining: number;
  savingsRate: number; // percentage

  // Helpers & Modals
  formatCurrency: (amount: number, hideDecimals?: boolean) => string;
  isNewTransactionModalOpen: boolean;
  setIsNewTransactionModalOpen: (open: boolean) => void;
  isNewGoalModalOpen: boolean;
  setIsNewGoalModalOpen: (open: boolean) => void;
  isNewCategoryModalOpen: boolean;
  setIsNewCategoryModalOpen: (open: boolean) => void;
  isEditBudgetModalOpen: boolean;
  setIsEditBudgetModalOpen: (open: boolean) => void;
  resetAllData: () => void;
  exportDataJSON: () => void;
  triggerConfetti: () => void;
}

const WealthContext = createContext<WealthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'wf_user_profile_v2',
  TRANSACTIONS: 'wf_transactions_v2',
  GOALS: 'wf_savings_goals_v2',
  CATEGORIES: 'wf_categories_v2',
  NOTIFICATIONS: 'wf_notifications_v2',
  SESSION: 'wf_session_active_v2',
  LAST_TAB: 'wf_last_active_tab_v2',
};

export const WealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : initialUserProfile;
    } catch {
      return initialUserProfile;
    }
  });

  // Session & Authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      // If no saved session value, user is not authenticated (shows landing)
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      return saved === 'true' ? 'app' : 'landing';
    } catch {
      return 'landing';
    }
  });

  const [activeTab, setActiveTabState] = useState<ActiveTab>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAST_TAB);
      return (saved as ActiveTab) || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  const [previousTab, setPreviousTab] = useState<ActiveTab>('dashboard');

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    localStorage.setItem(STORAGE_KEYS.LAST_TAB, tab);
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
      return saved ? JSON.parse(saved) : initialSavingsGoals;
    } catch {
      return initialSavingsGoals;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : initialCategories;
    } catch {
      return initialCategories;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : initialNotifications;
    } catch {
      return initialNotifications;
    }
  });

  // Lock Screen: If authenticated and pin is enabled, start locked on reload
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const isAuth = localStorage.getItem(STORAGE_KEYS.SESSION) === 'true';
    return isAuth && userProfile.isPinEnabled;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const finishLoading = () => {
    setIsLoading(false);
    setLoadingMessage('');
  };

  const simulateLoading = (durationMs = 1500, customMessage = '') => {
    setLoadingMessage(customMessage);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLoadingMessage('');
    }, durationMs);
  };

  // Auth methods
  const login = (credentials?: { email?: string; name?: string }) => {
    if (credentials?.email || credentials?.name) {
      setUserProfile((prev) => ({
        ...prev,
        name: credentials.name || prev.name,
        email: credentials.email || prev.email,
      }));
    }
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.SESSION, 'true');
    setCurrentRoute('app');
    setIsLocked(false);
    setIsAuthModalOpen(false);
    simulateLoading(1000, 'Connexion à votre espace WealthFlow...');
  };

  const registerUser = (data: { name: string; email: string; currency: string }) => {
    setUserProfile((prev) => ({
      ...prev,
      name: data.name || prev.name,
      email: data.email || prev.email,
      currency: data.currency || prev.currency,
    }));
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.SESSION, 'true');
    setCurrentRoute('app');
    setIsLocked(false);
    setIsAuthModalOpen(false);
    simulateLoading(1200, 'Création de votre coffre-fort WealthFlow...');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem(STORAGE_KEYS.SESSION, 'false');
    setCurrentRoute('landing');
    setIsLocked(false);
  };

  // Modals state
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isEditBudgetModalOpen, setIsEditBudgetModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalSaved = savingsGoals.reduce((acc, curr) => acc + curr.currentAmount, 0);

  // Base starting balance + income - expenses
  const startingAnchor = 1520000;
  const totalBalance = startingAnchor + totalIncome - totalExpenses;

  const monthlyBudgetTotal = categories
    .filter((c) => c.type === 'expense')
    .reduce((acc, curr) => acc + curr.budgetLimit, 0);

  const monthlyBudgetSpent = totalExpenses;
  const monthlyBudgetRemaining = Math.max(0, monthlyBudgetTotal - monthlyBudgetSpent);

  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 38;

  // Currency Formatter: 2 450 000 FCFA
  const formatCurrency = (amount: number, _hideDecimals = true): string => {
    const formatted = Math.round(amount)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formatted} ${userProfile.currency || 'FCFA'}`;
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF5330', '#18181B', '#10B981', '#F97316'],
      });
    } catch {
      // ignore
    }
  };

  // Transaction CRUD
  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [tx, ...prev]);

    // If it's a savings deposit, link to relevant goal if match found
    if (newTx.type === 'savings_deposit') {
      triggerConfetti();
    }
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Savings Goal CRUD
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      currentAmount: 0,
      checkboxesCount: goal.checkboxesCount || 10,
      checkedBoxes: [],
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
    triggerConfetti();
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const contributeToGoal = (id: string, amount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updatedAmount = Math.min(g.targetAmount, g.currentAmount + amount);
          if (updatedAmount >= g.targetAmount) {
            triggerConfetti();
          }
          return { ...g, currentAmount: updatedAmount };
        }
        return g;
      })
    );

    // Also record as transaction
    const targetGoal = savingsGoals.find((g) => g.id === id);
    if (targetGoal) {
      addTransaction({
        title: `Contribution: ${targetGoal.title}`,
        category: 'Épargne & Investissement',
        categoryId: 'cat-6',
        amount,
        type: 'savings_deposit',
        account: 'Compte principal',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        notes: `Ajout vers l'objectif ${targetGoal.title}`,
      });
    }
  };

  const toggleGoalCheckbox = (goalId: string, boxIndex: number) => {
    setSavingsGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== goalId) return goal;
        const checked = new Set(goal.checkedBoxes || []);
        const totalBoxes = goal.checkboxesCount || 10;
        const unitValue = goal.targetAmount / totalBoxes;

        if (checked.has(boxIndex)) {
          checked.delete(boxIndex);
        } else {
          checked.add(boxIndex);
        }

        const newCheckedBoxes = Array.from(checked);
        const calculatedAmount = Math.min(goal.targetAmount, Math.round(newCheckedBoxes.length * unitValue));
        
        if (calculatedAmount >= goal.targetAmount) {
          triggerConfetti();
        }

        return {
          ...goal,
          checkedBoxes: newCheckedBoxes,
          currentAmount: calculatedAmount,
        };
      })
    );
  };

  const toggleGoalAutoSave = (goalId: string) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, isAutoSaveActive: !g.isAutoSaveActive } : g))
    );
  };

  // Category CRUD
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Notification CRUD
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Profile & Security
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  const unlockWithPin = (pin: string): boolean => {
    if (!userProfile.isPinEnabled || pin === userProfile.pinCode) {
      setIsLocked(false);
      if (previousTab) {
        setActiveTab(previousTab);
      }
      return true;
    }
    return false;
  };

  const lockApp = () => {
    setPreviousTab(activeTab);
    setIsLocked(true);
  };

  const changePin = (oldPin: string, newPin: string): boolean => {
    if (oldPin === userProfile.pinCode && newPin.length === 4) {
      setUserProfile((prev) => ({ ...prev, pinCode: newPin }));
      return true;
    }
    return false;
  };

  // Reset & Export
  const resetAllData = () => {
    setUserProfile(initialUserProfile);
    setTransactions(initialTransactions);
    setSavingsGoals(initialSavingsGoals);
    setCategories(initialCategories);
    setNotifications(initialNotifications);
    localStorage.clear();
  };

  const exportDataJSON = () => {
    const data = {
      userProfile,
      transactions,
      savingsGoals,
      categories,
      notifications,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WealthFlow_Export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <WealthContext.Provider
      value={{
        userProfile,
        updateUserProfile,
        activeTab,
        setActiveTab,
        previousTab,
        isAuthenticated,
        currentRoute,
        setCurrentRoute,
        login,
        registerUser,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        savingsGoals,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        contributeToGoal,
        toggleGoalCheckbox,
        toggleGoalAutoSave,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        chartData: initialChartData,
        isLocked,
        unlockWithPin,
        lockApp,
        changePin,
        isLoading,
        loadingMessage,
        simulateLoading,
        finishLoading,
        totalBalance,
        totalIncome,
        totalExpenses,
        totalSaved,
        monthlyBudgetTotal,
        monthlyBudgetSpent,
        monthlyBudgetRemaining,
        savingsRate,
        formatCurrency,
        isNewTransactionModalOpen,
        setIsNewTransactionModalOpen,
        isNewGoalModalOpen,
        setIsNewGoalModalOpen,
        isNewCategoryModalOpen,
        setIsNewCategoryModalOpen,
        isEditBudgetModalOpen,
        setIsEditBudgetModalOpen,
        resetAllData,
        exportDataJSON,
        triggerConfetti,
      }}
    >
      {children}
    </WealthContext.Provider>
  );
};

export const useWealth = () => {
  const context = useContext(WealthContext);
  if (!context) {
    throw new Error('useWealth must be used within a WealthProvider');
  }
  return context;
};
