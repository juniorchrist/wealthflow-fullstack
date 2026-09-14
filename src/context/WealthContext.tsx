import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  initialCategories,
  initialChartData,
  initialNotifications,
  initialSavingsGoals,
  initialTransactions,
  initialUserProfile,
} from '../data/initialData';
import { ActiveTab, AdminUser, AppRoute, Category, MonthlyChartData, NotificationItem, SavingsGoal, Transaction, UserProfile } from '../types';
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
  login: (credentials?: { email?: string; name?: string; pinCode?: string }) => void;
  registerUser: (data: { name: string; email: string; currency: string; password?: string; phone?: string }) => void;
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
  // Admin session & Users Management
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (v: boolean) => void;
  registeredUsers: AdminUser[];
  deleteUser: (userId: string, reason?: string) => Promise<boolean>;
  refreshAdminUsers: () => Promise<void>;

  // Financial Computations
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSaved: number;
  monthlyBudgetTotal: number;
  monthlyBudgetSpent: number;
  monthlyBudgetRemaining: number;
  savingsRate: number; // percentage
  financialHealthScore: number;
  financialHealthMessage: string;

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
  REGISTERED_USERS: 'wf_registered_users_list_v2',
};

export const WealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        return JSON.parse(saved);
      }
      return initialUserProfile;
    } catch {
      return initialUserProfile;
    }
  });

  const [registeredUsers, setRegisteredUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Session & Authentication réelles
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      return Boolean(saved === 'true');
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
  const login = (credentials?: { email?: string; name?: string; pinCode?: string }) => {
    const updated = {
      ...userProfile,
      name: credentials?.name || userProfile.name,
      email: credentials?.email || userProfile.email,
      pinCode: credentials?.pinCode || userProfile.pinCode,
      isPinEnabled: Boolean(credentials?.pinCode || userProfile.pinCode),
    };
    if (credentials?.email || credentials?.name || credentials?.pinCode) {
      setUserProfile(updated);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    }
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.SESSION, 'true');
    setCurrentRoute('app');
    setIsLocked(false);
    refreshRemoteData();
  };

  const registerUser = (data: { name: string; email: string; currency: string; password?: string; phone?: string }) => {
    const formattedJoinDate = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    const userPin = data.password ? data.password.trim() : (userProfile.pinCode || '');
    const newProfile: UserProfile = {
      ...userProfile,
      name: data.name || userProfile.name,
      email: data.email || userProfile.email,
      currency: data.currency || userProfile.currency,
      pinCode: userPin,
      isPinEnabled: Boolean(userPin),
      phone: data.phone || userProfile.phone,
      createdAt: new Date().toISOString(),
    };
    setUserProfile(newProfile);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.SESSION, 'true');
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newProfile));
    setCurrentRoute('app');
    setIsLocked(false);

    // Enregistrer immédiatement dans la liste des utilisateurs réels
    const newUserEntry: AdminUser = {
      id: `u-${Date.now()}`,
      name: data.name || 'Nouvel utilisateur',
      email: data.email,
      phone: data.phone || '',
      plan: 'WealthFlow Pro',
      status: 'actif',
      lastLogin: 'En cours de session',
      joinDate: formattedJoinDate,
      income: 0,
      expenses: 0,
      savings: 0,
      transactions: 0,
      budgetTotal: 0,
    };
    setRegisteredUsers((prev) => {
      const filtered = prev.filter((u) => u.email.toLowerCase() !== data.email.toLowerCase());
      const updated = [newUserEntry, ...filtered];
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updated));
      return updated;
    });

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

  // Calcul dynamique et intelligent de la santé financière (0 à 100%)
  const financialHealthScore = useMemo(() => {
    // Si aucun mouvement enregistré, état initial neutre
    if (transactions.length === 0 && totalSaved === 0) {
      return 50;
    }

    let score = 0;

    // 1. Capacité et taux d'épargne (jusqu'à 40 points)
    if (totalIncome > 0) {
      const netSavings = totalIncome - totalExpenses;
      const rate = netSavings / totalIncome;
      if (rate >= 0.25) {
        score += 40; // 25% ou plus d'épargne
      } else if (rate > 0) {
        score += Math.round((rate / 0.25) * 40);
      } else {
        score += 0; // Déficit (dépenses > revenus)
      }
    } else {
      score += totalExpenses === 0 ? 25 : 0;
    }

    // 2. Maîtrise et respect du budget mensuel (jusqu'à 35 points)
    if (monthlyBudgetTotal > 0) {
      const budgetUsage = totalExpenses / monthlyBudgetTotal;
      if (budgetUsage <= 0.70) {
        score += 35; // Utilisation saine (< 70%)
      } else if (budgetUsage <= 1.0) {
        score += Math.round(35 * (1 - ((budgetUsage - 0.70) / 0.30) * 0.4)); // 21 à 35 pts
      } else {
        // Dépassement budgétaire
        score += Math.max(5, Math.round(21 - (budgetUsage - 1.0) * 20));
      }
    } else {
      score += totalExpenses <= totalIncome ? 25 : 10;
    }

    // 3. Réserve d'urgence et objectifs d'épargne (jusqu'à 25 points)
    if (savingsGoals.length > 0) {
      const avgProgress =
        savingsGoals.reduce((sum, g) => {
          const p = g.targetAmount > 0 ? g.currentAmount / g.targetAmount : 0;
          return sum + Math.min(1, p);
        }, 0) / savingsGoals.length;
      score += Math.round(avgProgress * 25);
    } else if (totalSaved > 0 || totalBalance > 0) {
      score += 18;
    } else {
      score += 10;
    }

    return Math.min(100, Math.max(10, Math.round(score)));
  }, [transactions.length, totalSaved, totalIncome, totalExpenses, monthlyBudgetTotal, savingsGoals, totalBalance]);

  const financialHealthMessage = useMemo(() => {
    if (transactions.length === 0 && totalSaved === 0) {
      return 'Ajoutez vos premières opérations pour affiner votre score.';
    }
    if (financialHealthScore >= 80) return 'Excellente gestion financière ! Vos flux sont exemplaires.';
    if (financialHealthScore >= 65) return 'Vous êtes sur la bonne voie ! Vos flux sont bien maîtrisés.';
    if (financialHealthScore >= 50) return 'Gestion équilibrée. Surveillez vos postes de dépenses.';
    return 'Attention : vos dépenses dépassent vos seuils conseillés.';
  }, [financialHealthScore, transactions.length, totalSaved]);

  // Synchronisation dynamique de l'utilisateur actif réel dans la liste des utilisateurs enregistrés
  useEffect(() => {
    if (isAuthenticated && (userProfile.email || userProfile.name)) {
      setRegisteredUsers((prev) => {
        const email = userProfile.email || 'utilisateur@wealthflow.app';
        const existingIdx = prev.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
        const userEntry: AdminUser = {
          id: existingIdx >= 0 ? prev[existingIdx].id : (userProfile.id || `u-${Date.now()}`),
          name: userProfile.name || 'Utilisateur actif',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          plan: userProfile.plan || 'WealthFlow Pro',
          status: 'actif',
          lastLogin: 'En cours de session',
          joinDate: existingIdx >= 0 && prev[existingIdx].joinDate
            ? prev[existingIdx].joinDate
            : new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
          income: totalIncome,
          expenses: totalExpenses,
          savings: totalSaved,
          transactions: transactions.length,
          budgetTotal: monthlyBudgetTotal,
        };

        let updated: AdminUser[];
        if (existingIdx >= 0) {
          updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], ...userEntry };
        } else {
          updated = [userEntry, ...prev];
        }
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updated));
        return updated;
      });
    }
  }, [
    isAuthenticated,
    userProfile.name,
    userProfile.email,
    userProfile.phone,
    userProfile.plan,
    totalIncome,
    totalExpenses,
    totalSaved,
    transactions.length,
    monthlyBudgetTotal,
  ]);

  // Suppression et bannissement d'un utilisateur par l'administrateur (avec motif réel)
  const deleteUser = async (userId: string, reason?: string): Promise<boolean> => {
    try {
      await api.admin.deleteUser(userId, reason);
    } catch (e) {
      console.warn('[WealthFlow API] Erreur lors de la suppression distante:', e);
    }

    setRegisteredUsers((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updated));
      return updated;
    });

    // Si l'utilisateur supprimé est la session active, le déconnecter
    const toDelete = registeredUsers.find((u) => u.id === userId);
    if (toDelete && toDelete.email.toLowerCase() === userProfile.email?.toLowerCase()) {
      logout();
    }
    return true;
  };

  const refreshAdminUsers = async () => {
    try {
      const res = await api.admin.getUsers();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setRegisteredUsers(res.data);
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn('[WealthFlow API] Erreur récupération utilisateurs admin:', err);
    }
  };

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
    // Si la protection par PIN/code n'est pas activée, déverrouiller
    if (!userProfile.isPinEnabled) {
      setIsLocked(false);
      if (previousTab) setActiveTab(previousTab);
      return true;
    }

    // Valide uniquement et strictement si le code correspond au mot de passe de compte
    const valid = Boolean(userProfile.pinCode && pin === userProfile.pinCode);
    if (valid) {
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
        registeredUsers,
        deleteUser,
        refreshAdminUsers,
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
        financialHealthScore,
        financialHealthMessage,
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
