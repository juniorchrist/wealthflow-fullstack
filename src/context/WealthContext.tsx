import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  initialCategories,
  initialChartData,
  initialNotifications,
  initialSavingsGoals,
  initialTransactions,
  initialUserProfile,
} from '../data/initialData';
import { ActiveTab, AppRoute, Category, MonthlyChartData, NotificationItem, SavingsGoal, Transaction, UserProfile } from '../types';
import { api, getAuthToken, clearAuthTokens } from '../services/api';

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
  simulateLoading: (message?: string) => void;
  finishLoading: () => void;
  
  // Auth Modal
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  // Admin session
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (v: boolean) => void;

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
  autoDistributeBudgets: (incomeBase: number) => void;
  resetAllData: () => void;
  exportDataJSON: () => void;
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
  // Vérifier si un token réel existe
  const hasToken = typeof window !== 'undefined' ? Boolean(getAuthToken()) : false;

  // Nettoyage automatique des anciennes données de démo/bêta si pas de token
  if (typeof window !== 'undefined' && !hasToken) {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser && (savedUser.includes('Junior Diploh') || savedUser.includes('junior.diploh'))) {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
        localStorage.removeItem(STORAGE_KEYS.GOALS);
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      }
    } catch {}
  }

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const token = getAuthToken();
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (token && saved) {
        return JSON.parse(saved);
      }
      return initialUserProfile;
    } catch {
      return initialUserProfile;
    }
  });

  // Session & Authentication réelles
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const token = getAuthToken();
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      return Boolean(token && saved === 'true');
    } catch {
      return false;
    }
  });

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    try {
      const token = getAuthToken();
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      return (token && saved === 'true') ? 'app' : 'landing';
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
  const [loadingMessage, setLoadingMessage] = useState<string>('Chargement de votre espace...');

  const finishLoading = () => {
    setIsLoading(false);
  };

  const simulateLoading = (message?: string) => {
    if (message) setLoadingMessage(message);
    setIsLoading(true);
  };

  // Auth Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Admin session — indépendant de l'auth utilisateur
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Charger les données distantes depuis l'API Backend Supabase
  const refreshRemoteData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      // 1. Profil
      const profileRes = await api.auth.me();
      if (profileRes.success && profileRes.data) {
        const u = profileRes.data;
        setUserProfile((prev) => ({
          ...prev,
          name: `${u.prenom || ''} ${u.nom || ''}`.trim() || prev.name,
          email: u.email || prev.email,
          phone: u.numero || prev.phone,
          currency: u.currency || prev.currency,
          language: u.language || prev.language,
          timezone: u.timezone || prev.timezone,
          dateFormat: u.dateFormat || prev.dateFormat,
          plan: u.plan || prev.plan,
          isPinEnabled: u.isPinEnabled ?? prev.isPinEnabled,
        }));
      }

      // 2. Transactions
      const txRes = await api.transactions.getAll({ limit: 100 });
      if (txRes.success && txRes.data?.transactions) {
        const remoteTxs: Transaction[] = txRes.data.transactions.map((t: any) => ({
          id: t.id,
          title: t.title,
          amount: t.amount,
          type: t.type as any,
          category: t.category?.name || 'Général',
          categoryId: t.categoryId,
          account: t.account?.name || 'Compte principal',
          date: t.date ? new Date(t.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          time: t.time || '12:00',
          notes: t.notes || '',
        }));
        setTransactions(remoteTxs);
      }

      // 3. Catégories
      const catRes = await api.categories.getAll();
      if (catRes.success && Array.isArray(catRes.data) && catRes.data.length > 0) {
        const remoteCats: Category[] = catRes.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          icon: c.icon || 'Tag',
          color: c.color || '#FF5330',
          budgetLimit: c.budgetLimit || 0,
          type: c.type as 'expense' | 'income',
        }));
        setCategories(remoteCats);
      }

      // 4. Objectifs d'épargne
      const goalsRes = await api.savings.getAll();
      if (goalsRes.success && Array.isArray(goalsRes.data)) {
        const remoteGoals: SavingsGoal[] = goalsRes.data.map((g: any) => ({
          id: g.id,
          title: g.title,
          targetAmount: g.targetAmount,
          currentAmount: g.currentAmount || 0,
          deadline: g.deadline || '',
          icon: g.icon || 'Target',
          color: g.color || '#3B82F6',
          description: g.description || '',
          isAutoSaveActive: g.isAutoSaveActive || false,
          autoSaveAmount: g.autoSaveAmount || undefined,
          checkboxesCount: g.checkboxesCount || 10,
          checkedBoxes: g.checkedBoxes || [],
        }));
        setSavingsGoals(remoteGoals);
      }

      // 5. Notifications
      const notifRes = await api.notifications.getAll();
      if (notifRes.success && Array.isArray(notifRes.data)) {
        const remoteNotifs: NotificationItem[] = notifRes.data.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          date: n.createdAt ? new Date(n.createdAt).toLocaleDateString('fr-FR') : 'Récemment',
          read: n.read || false,
          type: (n.type as any) || 'info',
        }));
        setNotifications(remoteNotifs);
      }
    } catch (err) {
      console.warn('[WealthFlow API] Erreur lors du chargement des données distantes:', err);
    }
  }, []);

  // Déclencher le chargement distant quand la session est active
  useEffect(() => {
    if (isAuthenticated) {
      refreshRemoteData();
    }
  }, [isAuthenticated, refreshRemoteData]);

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
    refreshRemoteData();
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
    refreshRemoteData();
  };

  const logout = () => {
    api.auth.logout().catch(() => {});
    clearAuthTokens();
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    setUserProfile(initialUserProfile);
    setTransactions([]);
    setSavingsGoals([]);
    setNotifications([]);
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

  // Calculations réelles basées uniquement sur les opérations effectives
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalSaved = savingsGoals.reduce((acc, curr) => acc + curr.currentAmount, 0);

  // Solde disponible réel : Revenus totaux - Dépenses totales
  const totalBalance = totalIncome - totalExpenses;

  const monthlyBudgetTotal = categories
    .filter((c) => c.type === 'expense')
    .reduce((acc, curr) => acc + curr.budgetLimit, 0);

  const monthlyBudgetSpent = totalExpenses;
  const monthlyBudgetRemaining = Math.max(0, monthlyBudgetTotal - monthlyBudgetSpent);

  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  // Currency Formatter: 2 450 000 FCFA
  const formatCurrency = (amount: number, _hideDecimals = true): string => {
    const formatted = Math.round(amount)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formatted} ${userProfile.currency || 'FCFA'}`;
  };

  // Transaction CRUD connecté à l'API Backend
  const addTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    const tempId = `tx-${Date.now()}`;
    const tx: Transaction = {
      ...newTx,
      id: tempId,
    };
    setTransactions((prev) => [tx, ...prev]);

    try {
      const res = await api.transactions.create({
        title: newTx.title,
        amount: Number(newTx.amount),
        type: newTx.type,
        categoryId: newTx.categoryId || 'cat-1',
        date: newTx.date,
        time: newTx.time,
        notes: newTx.notes,
      });

      if (res.success && res.data?.id) {
        // Mettre à jour l'ID temporaire avec l'ID réel renvoyé par Supabase
        setTransactions((prev) =>
          prev.map((t) => (t.id === tempId ? { ...t, id: res.data.id } : t))
        );
      }
    } catch (err) {
      console.warn('[WealthFlow API] Erreur lors de l\'ajout de transaction:', err);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    try {
      await api.transactions.update(id, updates);
    } catch (err) {
      console.warn('[WealthFlow API] Erreur lors de la mise à jour de transaction:', err);
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.transactions.delete(id);
    } catch (err) {
      console.warn('[WealthFlow API] Erreur lors de la suppression de transaction:', err);
    }
  };

  // Savings Goal CRUD connecté à l'API Backend
  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const tempId = `goal-${Date.now()}`;
    const newGoal: SavingsGoal = {
      ...goal,
      id: tempId,
      currentAmount: 0,
      checkboxesCount: goal.checkboxesCount || 10,
      checkedBoxes: [],
    };
    setSavingsGoals((prev) => [...prev, newGoal]);

    try {
      const res = await api.savings.create({
        title: goal.title,
        targetAmount: Number(goal.targetAmount),
        deadline: goal.deadline || '',
        icon: goal.icon || 'Target',
        color: goal.color || '#3B82F6',
        description: goal.description,
      });

      if (res.success && res.data?.id) {
        setSavingsGoals((prev) =>
          prev.map((g) => (g.id === tempId ? { ...g, id: res.data.id } : g))
        );
      }
    } catch (err) {
      console.warn('[WealthFlow API] Erreur lors de l\'ajout d\'objectif:', err);
    }
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    try {
      await api.savings.update(id, updates);
    } catch (err) {
      console.warn('[WealthFlow API] Erreur lors de la mise à jour d\'objectif:', err);
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    try {
      await api.savings.delete(id);
    } catch (err) {
      console.warn('[WealthFlow API] Erreur lors de la suppression d\'objectif:', err);
    }
  };

  const contributeToGoal = async (id: string, amount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updatedAmount = Math.min(g.targetAmount, g.currentAmount + amount);
          return { ...g, currentAmount: updatedAmount };
        }
        return g;
      })
    );

    try {
      await api.savings.deposit(id, {
        amount,
        date: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[WealthFlow API] Erreur lors du dépôt d\'épargne:', err);
    }

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

  // Category CRUD connecté à l'API Backend
  const addCategory = async (cat: Omit<Category, 'id'>) => {
    const tempId = `cat-${Date.now()}`;
    const newCat: Category = {
      ...cat,
      id: tempId,
    };
    setCategories((prev) => [...prev, newCat]);

    try {
      const res = await api.categories.create({
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        budgetLimit: Number(cat.budgetLimit) || 0,
        type: cat.type,
      });

      if (res.success && res.data?.id) {
        setCategories((prev) =>
          prev.map((c) => (c.id === tempId ? { ...c, id: res.data.id } : c))
        );
      }
    } catch (err) {
      console.warn('[WealthFlow API] Erreur lors de l\'ajout de catégorie:', err);
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    try {
      await api.categories.update(id, updates);
    } catch (err) {
      console.warn('[WealthFlow API] Erreur lors de la mise à jour de catégorie:', err);
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      await api.categories.delete(id);
    } catch (err) {
      console.warn('[WealthFlow API] Erreur lors de la suppression de catégorie:', err);
    }
  };

  // Distribute budgets automatically based on totalIncome
  // Uses a simplified 50/30/20 split across expense categories, weighted by existing limits
  const autoDistributeBudgets = (incomeBase: number) => {
    const expenseCats = categories.filter((c) => c.type === 'expense');
    if (expenseCats.length === 0) return;

    // 70% of income allocated to expense categories
    const allocatable = Math.round(incomeBase * 0.7);
    const totalExistingLimits = expenseCats.reduce((s, c) => s + (c.budgetLimit || 1), 0);

    setCategories((prev) =>
      prev.map((c) => {
        if (c.type !== 'expense') return c;
        const weight = (c.budgetLimit || 1) / totalExistingLimits;
        return { ...c, budgetLimit: Math.round(allocatable * weight) };
      })
    );
  };

  // Notification CRUD connecté à l'API Backend
  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await api.notifications.markRead(id);
    } catch (err) {
      console.warn('[WealthFlow API] Erreur lors de la mise à jour de notification:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.notifications.markAllRead();
    } catch (err) {
      console.warn('[WealthFlow API] Erreur lors du marquage des notifications:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await api.notifications.delete(id);
    } catch (err) {
      console.warn('[WealthFlow API] Erreur lors de la suppression de notification:', err);
    }
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
        isAdminAuthenticated,
        setIsAdminAuthenticated,
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
        autoDistributeBudgets,
        resetAllData,
        exportDataJSON,
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
