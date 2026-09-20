import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { initialUserProfile } from '../data/initialData';
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
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>, initialDeposit?: number) => void;
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
  addNotification: (notif: Omit<NotificationItem, 'id'>) => void;
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
  isDataLoading: boolean;
  dataLoadError: string | null;
  
  // Auth Modal
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  // Admin session & Users Management
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (v: boolean) => void;
  registeredUsers: AdminUser[];
  deleteUser: (userId: string, reason?: string, userEmail?: string) => Promise<boolean>;
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



  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Lock Screen: If authenticated and pin is enabled, start locked on reload/reopen
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const isAuth = localStorage.getItem(STORAGE_KEYS.SESSION) === 'true';
    const token = getAuthToken();
    if (!isAuth || !token) return false;
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.isPinEnabled === false && !u.pinCode) {
          return false;
        }
      }
    } catch {}
    return true;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('Chargement de votre espace...');
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);

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
  const [isAdminAuthenticated, setIsAdminAuthenticatedState] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem('wf_admin_authenticated') === 'true' &&
        Boolean(localStorage.getItem('wf_admin_auth_token'))
      );
    } catch {
      return false;
    }
  });

  const setIsAdminAuthenticated = (v: boolean) => {
    setIsAdminAuthenticatedState(v);
    if (v) {
      sessionStorage.setItem('wf_admin_authenticated', 'true');
    } else {
      sessionStorage.removeItem('wf_admin_authenticated');
    }
  };

  // Charger les données distantes depuis l'API Backend Supabase
  const refreshRemoteData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    setIsDataLoading(true);
    setDataLoadError(null);

    try {
      // 1. Profil
      const profileRes = await api.auth.me();
      if (profileRes.success && profileRes.data) {
        const u = profileRes.data.user || profileRes.data;
        const pinEnabled = Boolean(u.isPinEnabled);
        
        // Ne pas modifier isLocked ici - c'est géré par login() et unlockWithPin()
        // refreshRemoteData() ne doit que mettre à jour le profil
        
        setUserProfile((prev) => {
          const pinEnabled = prev.pinCode ? true : Boolean(u.isPinEnabled ?? prev.isPinEnabled);
          const updatedProfile: UserProfile = {
            ...prev,
            // FIX Bug 5 : mapper l'id réel de l'utilisateur pour les tickets support
            id: u.id || prev.id,
            name: `${u.prenom || ''} ${u.nom || ''}`.trim() || prev.name,
            email: u.email || prev.email,
            phone: u.numero || prev.phone,
            currency: u.currency || prev.currency,
            language: u.language || prev.language,
            timezone: u.timezone || prev.timezone,
            dateFormat: u.dateFormat || prev.dateFormat,
            plan: u.plan || prev.plan,
            role: u.role || prev.role || 'user',
            isPinEnabled: pinEnabled,
          };
          try {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedProfile));
          } catch {}
          return updatedProfile;
        });
      } else if (
        profileRes.message?.includes('introuvable') ||
        profileRes.message?.includes('supprimé') ||
        profileRes.message?.includes('banni') ||
        profileRes.error?.code === 'ACCOUNT_NOT_FOUND' ||
        profileRes.error?.code === 'ACCOUNT_BANNED'
      ) {
        console.warn('[WealthFlow] Compte révoqué ou banni par l’administrateur. Déconnexion automatique.');
        logout();
        return;
      }

      // 2. Comptes bancaires
      const accountsRes = await api.accounts.getAll();
      if (accountsRes.success && Array.isArray(accountsRes.data)) {
        // Stocker les comptes dans le localStorage pour synchronisation
        localStorage.setItem('wf_accounts', JSON.stringify(accountsRes.data));
      }

      // 3. Transactions
      let remoteTxs: Transaction[] = [];
      const txRes = await api.transactions.getAll({ limit: 100 });
      const txData = txRes.data?.transactions || (Array.isArray(txRes.data) ? txRes.data : null);
      if (txRes.success && Array.isArray(txData)) {
        remoteTxs = txData.map((t: any) => ({
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
      } else if (!txRes.success) {
        console.warn('[WealthFlow API] Erreur lors du chargement des transactions:', txRes.message);
        setDataLoadError(txRes.message || 'Erreur lors de la récupération des transactions');
      }

      // 4. Catégories
      const catRes = await api.categories.getAll();
      const catData = (catRes.data as any)?.categories || catRes.data;
      if (catRes.success && Array.isArray(catData) && catData.length > 0) {
        const remoteCats: Category[] = catData.map((c: any) => ({
          id: c.id,
          name: c.name,
          icon: c.icon || 'Tag',
          color: c.color || '#FF5330',
          budgetLimit: c.budgetLimit || 0,
          type: c.type as 'expense' | 'income',
        }));
        setCategories(remoteCats);
      } else if (!catRes.success) {
        console.warn('[WealthFlow API] Erreur lors du chargement des catégories:', catRes.message);
      }

      // 5. Objectifs d'épargne
      const goalsRes = await api.savings.getAll();
      if (goalsRes.success && goalsRes.data) {
        const goalsData = goalsRes.data.goals || (Array.isArray(goalsRes.data) ? goalsRes.data : null);
        if (Array.isArray(goalsData)) {
          const remoteGoals: SavingsGoal[] = goalsData.map((g: any) => ({
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

          // Note: Ne plus reconstituer automatiquement les activités de paliers.
          // Les paliers cochés créent maintenant leurs propres transactions via toggleGoalCheckbox.
          // Cette logique de réconciliation n'est plus nécessaire car les transactions sont persistées en backend.
        }
      } else if (!goalsRes.success) {
        console.warn('[WealthFlow API] Erreur lors du chargement des objectifs d\'épargne:', goalsRes.message);
        setDataLoadError(goalsRes.message || 'Erreur lors de la récupération des objectifs d\'épargne');
      }

      // 6. Notifications
      const notifRes = await api.notifications.getAll();
      const notifData = (notifRes.data as any)?.notifications || notifRes.data;
      if (notifRes.success && Array.isArray(notifData)) {
        const remoteNotifs: NotificationItem[] = notifData.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          date: n.createdAt ? new Date(n.createdAt).toLocaleDateString('fr-FR') : 'Récemment',
          read: n.read || false,
          type: (n.type as any) || 'info',
        }));
        setNotifications(remoteNotifs);
      } else if (!notifRes.success) {
        console.warn('[WealthFlow API] Erreur lors du chargement des notifications:', notifRes.message);
      }
    } catch (err: any) {
      console.error('[WealthFlow API] Erreur critique lors du chargement des données distantes:', err);
      setDataLoadError(err.message || 'Impossible de joindre le serveur. Vérifiez votre connexion.');
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  // Déclencher le chargement distant quand la session est active
  useEffect(() => {
    if (isAuthenticated) {
      refreshRemoteData();
    }
  }, [isAuthenticated, refreshRemoteData]);

  // Vérifier le verrouillage au démarrage de l'application
  // FIX Bug 1 : checkLockOnStartup vérifie l'état réel de la session.
  // Si session active et PIN activé -> verrouille immédiatement avant le dashboard.
  useEffect(() => {
    const checkLockOnStartup = async () => {
      const token = getAuthToken();
      const isAuth = localStorage.getItem(STORAGE_KEYS.SESSION) === 'true';
      
      if (!token || !isAuth) {
        // Pas de session active → déverrouiller (utilisateur déconnecté)
        setIsLocked(false);
        return;
      }

      try {
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        let pinEnabled = true;
        if (savedUser) {
          const u = JSON.parse(savedUser);
          if (u.isPinEnabled === false && !u.pinCode) {
            pinEnabled = false;
          }
        }

        if (pinEnabled) {
          // Utilisateur connecté revenant sur le site avec PIN activé -> verrouiller
          setIsLocked(true);
        } else {
          // Pas de PIN configuré du tout → accès libre
          setIsLocked(false);
        }
      } catch (err) {
        console.warn('[WealthFlow] Erreur lors de la vérification du verrouillage:', err);
      }
    };

    checkLockOnStartup();
  }, []); // Exécuter une seule fois au démarrage

  // Auth methods
  const login = async (credentials?: { id?: string; email?: string; name?: string; pinCode?: string; role?: string }) => {
    // Utiliser le rôle passé depuis l'API login (source de vérité)
    const userRole = credentials?.role || 'user';
    
    // Déterminer si le PIN est activé
    const pinEnabled = Boolean(credentials?.pinCode || userProfile.pinCode);

    const updated = {
      ...userProfile,
      id: credentials?.id || userProfile.id,
      name: credentials?.name || userProfile.name,
      email: credentials?.email || userProfile.email,
      pinCode: credentials?.pinCode || userProfile.pinCode,
      isPinEnabled: pinEnabled,
    };
    if (credentials?.email || credentials?.name || credentials?.pinCode || credentials?.id) {
      setUserProfile(updated);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    }
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.SESSION, 'true');

    // Redirection basée sur le rôle réel depuis l'API
    if (userRole === 'admin') {
      setIsAdminAuthenticated(true);
      setCurrentRoute('app');
      setActiveTab('admin');
    } else {
      setIsAdminAuthenticated(false);
      setCurrentRoute('app');
      setActiveTab('dashboard');
    }

    // L'utilisateur vient d'entrer ses identifiants avec succès → déverrouiller
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
    sessionStorage.setItem('wf_session_unlocked', 'true');

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
    sessionStorage.removeItem('wf_session_unlocked');
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



  // Calculs réels basés sur les transactions
  const totalIncome = useMemo(() => {
    return transactions.filter((t) => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions.filter((t) => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  // Calcul des dépenses du mois courant uniquement (pour l'utilisation du budget)
  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    return transactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        const d = new Date(t.date);
        return !isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  const totalSavingsDeposits = useMemo(() => {
    return transactions.filter((t) => t.type === 'savings_deposit').reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  // Source de vérité unique pour le total des épargnes : somme réactive de tous les objectifs d'épargne
  const totalSaved = useMemo(() => {
    return savingsGoals.reduce((acc, curr) => acc + (Number(curr.currentAmount) || 0), 0);
  }, [savingsGoals]);

  // Solde disponible réel : Revenus totaux - Dépenses totales - Épargnes placées
  const totalBalance = totalIncome - totalExpenses - totalSaved;

  const monthlyBudgetTotal = categories
    .filter((c) => c.type === 'expense')
    .reduce((acc, curr) => acc + curr.budgetLimit, 0);

  // IMPORTANT : Utiliser les dépenses du mois courant pour l'utilisation du budget (source de vérité identique au backend)
  const monthlyBudgetSpent = currentMonthExpenses;
  const monthlyBudgetRemaining = Math.max(0, monthlyBudgetTotal - monthlyBudgetSpent);

  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  // Calcul dynamique des flux mensuels pour les graphiques (Revenus, Dépenses, Épargne)
  // Strictement basé sur les transactions réelles et leurs dates, sans mois futurs ni données fictives
  const chartData = useMemo<MonthlyChartData[]>(() => {
    if (transactions.length === 0) {
      return [];
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed (ex: 8 pour septembre)

    const MONTH_DEFS = [
      { short: 'Janv.', full: 'Janvier' },
      { short: 'Févr.', full: 'Février' },
      { short: 'Mars', full: 'Mars' },
      { short: 'Avr.', full: 'Avril' },
      { short: 'Mai', full: 'Mai' },
      { short: 'Juin', full: 'Juin' },
      { short: 'Juil.', full: 'Juillet' },
      { short: 'Août', full: 'Août' },
      { short: 'Sept.', full: 'Septembre' },
      { short: 'Oct.', full: 'Octobre' },
      { short: 'Nov.', full: 'Novembre' },
      { short: 'Déc.', full: 'Décembre' },
    ];

    // Générer les mois glissants passés jusqu'au mois actuel (inclus) — aucun mois futur
    const rollingMonths: { year: number; monthNum: number; shortName: string; fullName: string }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      rollingMonths.push({
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        shortName: MONTH_DEFS[d.getMonth()].short,
        fullName: MONTH_DEFS[d.getMonth()].full,
      });
    }

    const aggregated = rollingMonths.map((m) => {
      let rev = 0;
      let dep = 0;
      let ep = 0;

      transactions.forEach((t) => {
        const d = new Date(t.date);
        if (!isNaN(d.getTime()) && d.getFullYear() === m.year && d.getMonth() === m.monthNum) {
          if (t.type === 'income') rev += t.amount;
          else if (t.type === 'expense') dep += t.amount;
          else if (t.type === 'savings_deposit') ep += t.amount;
        }
      });

      return {
        month: m.shortName,
        fullMonth: m.fullName,
        revenus: rev,
        depenses: dep,
        epargne: ep,
      };
    });

    // Ne retourner que les données réelles (vide si aucune transaction)
    const hasData = aggregated.some((m) => m.revenus > 0 || m.depenses > 0 || m.epargne > 0);
    if (!hasData) {
      return [];
    }

    return aggregated;
  }, [transactions]);

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
      const budgetUsage = currentMonthExpenses / monthlyBudgetTotal;
      if (budgetUsage <= 0.70) {
        score += 35; // Utilisation saine (< 70%)
      } else if (budgetUsage <= 1.0) {
        score += Math.round(35 * (1 - ((budgetUsage - 0.70) / 0.30) * 0.4)); // 21 à 35 pts
      } else {
        // Dépassement budgétaire
        score += Math.max(5, Math.round(21 - (budgetUsage - 1.0) * 20));
      }
    } else {
      score += currentMonthExpenses <= totalIncome ? 25 : 10;
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
  }, [transactions.length, totalSaved, totalIncome, totalExpenses, monthlyBudgetTotal, currentMonthExpenses, savingsGoals, totalBalance]);

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
        const existing = existingIdx >= 0 ? prev[existingIdx] : null;

        // Conserver les données de budget issues du backend (elles sont exactes),
        // ne les écraser QUE si elles n'existent pas encore (premier login, aucune donnée API reçue).
        const resolvedBudgetTotal =
          existing?.budgetTotal !== undefined && existing.budgetTotal > 0
            ? existing.budgetTotal
            : monthlyBudgetTotal;

        const userEntry: AdminUser = {
          id: existing ? existing.id : (userProfile.id || `u-${Date.now()}`),
          name: userProfile.name || 'Utilisateur actif',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          plan: userProfile.plan || 'WealthFlow Pro',
          status: 'actif',
          lastLogin: 'En cours de session',
          joinDate: existing?.joinDate
            ? existing.joinDate
            : new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
          income: totalIncome,
          expenses: totalExpenses,
          savings: totalSaved,
          transactions: transactions.length,
          // Utiliser les mêmes calculs que le dashboard utilisateur et le backend (source de vérité unique)
          budgetTotal: resolvedBudgetTotal,
          budgetSpent: currentMonthExpenses,
          budgetUsagePercentage: 
            resolvedBudgetTotal > 0
              ? Math.min(100, Math.round((currentMonthExpenses / resolvedBudgetTotal) * 100))
              : 0,
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
    currentMonthExpenses,
  ]);

  // Suppression et bannissement d'un utilisateur par l'administrateur (avec motif réel)
  const deleteUser = async (userId: string, reason?: string, userEmail?: string): Promise<boolean> => {
    let success = false;
    try {
      const res = await api.admin.deleteUser(userId, reason, userEmail);
      success = Boolean(res.success);
    } catch (e) {
      console.warn('[WealthFlow API] Erreur lors de la suppression distante:', e);
    }

    setRegisteredUsers((prev) => {
      const updated = prev.filter(
        (u) =>
          u.id !== userId &&
          (!userEmail || u.email.toLowerCase() !== userEmail.toLowerCase())
      );
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updated));
      return updated;
    });

    // Si l'utilisateur supprimé est la session active, le déconnecter
    const toDelete = registeredUsers.find(
      (u) =>
        u.id === userId ||
        (userEmail && u.email.toLowerCase() === userEmail.toLowerCase())
    );
    if (toDelete && toDelete.email.toLowerCase() === userProfile.email?.toLowerCase()) {
      logout();
    }
    return success;
  };

  const refreshAdminUsers = useCallback(async () => {
    try {
      const res = await api.admin.getUsers();
      if (res.success && Array.isArray(res.data)) {
        setRegisteredUsers(res.data);
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn('[WealthFlow API] Erreur récupération utilisateurs admin:', err);
    }
  }, []);

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

      const realId = res.data?.transaction?.id || res.data?.id;
      if (res.success && realId) {
        // Mettre à jour l'ID temporaire avec l'ID réel renvoyé par Supabase
        setTransactions((prev) =>
          prev.map((t) => (t.id === tempId ? { ...t, id: realId } : t))
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
  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>, initialDeposit?: number) => {
    const tempId = `goal-${Date.now()}`;
    const initialAmount = initialDeposit && initialDeposit > 0 ? initialDeposit : 0;
    const newGoal: SavingsGoal = {
      ...goal,
      id: tempId,
      currentAmount: initialAmount,
      checkboxesCount: goal.checkboxesCount || 10,
      checkedBoxes: [],
      isAutoSaveActive: goal.isAutoSaveActive || false,
    };

    setSavingsGoals((prev) => [newGoal, ...prev]);

    // Si un dépôt initial est spécifié, ajouter immédiatement la transaction correspondante (source unique de vérité)
    const tempTxId = `tx-dep-${Date.now()}`;
    if (initialAmount > 0) {
      const initTx: Transaction = {
        id: tempTxId,
        title: `Dépôt initial - ${goal.title}`,
        amount: initialAmount,
        type: 'savings_deposit',
        category: 'Épargne & Investissement',
        categoryId: 'default-epargne-auto',
        account: 'Compte principal',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        notes: `Versement initial sur ${goal.title}`,
      };
      setTransactions((prev) => [initTx, ...prev]);
    }

    try {
      const res = await api.savings.create({
        title: goal.title,
        targetAmount: Number(goal.targetAmount),
        deadline: goal.deadline || '',
        icon: goal.icon || 'Target',
        color: goal.color || '#3B82F6',
        description: goal.description,
      });

      const realGoalId = res.data?.goal?.id || res.data?.id;
      if (res.success && realGoalId) {
        setSavingsGoals((prev) =>
          prev.map((g) => (g.id === tempId ? { ...g, id: realGoalId } : g))
        );
        // Persister le dépôt initial en backend s'il existe
        if (initialAmount > 0) {
          const depRes = await api.savings.deposit(realGoalId, {
            amount: initialAmount,
            date: new Date().toISOString(),
          });
          const depositData = depRes.data?.deposit || depRes.data;
          const realTxId = depositData?.transaction?.id || depositData?.transactionId;
          if (realTxId) {
            setTransactions((prev) =>
              prev.map((t) => (t.id === tempTxId ? { ...t, id: realTxId } : t))
            );
          }
          const remoteGoalAmount = depRes.data?.goal?.currentAmount;
          if (typeof remoteGoalAmount === 'number') {
            setSavingsGoals((prev) =>
              prev.map((g) => (g.id === realGoalId ? { ...g, currentAmount: remoteGoalAmount } : g))
            );
          }
        }
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
    // Suppression optimiste immédiate
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    
    try {
      await api.savings.delete(id);
    } catch (err) {
      console.warn('[WealthFlow API] Erreur lors de la suppression d\'objectif:', err);
    }
  };

  const contributeToGoal = async (id: string, amount: number) => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) return;

    // FIX Bug 2 : Optimistic update immédiat — plus de re-fetch qui écrasait l'état
    // 1. Mettre à jour immédiatement le montant de l'objectif ciblé (optimistic update)
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, currentAmount: g.currentAmount + numericAmount } : g))
    );

    // 2. Ajouter immédiatement la transaction de versement d'épargne (optimistic)
    const goalTitle = savingsGoals.find((g) => g.id === id)?.title || 'Objectif';
    const tempTxId = `tx-dep-${Date.now()}`;
    const newTx: Transaction = {
      id: tempTxId,
      title: `Dépôt - ${goalTitle}`,
      amount: numericAmount,
      type: 'savings_deposit',
      category: 'Épargne & Investissement',
      categoryId: 'default-epargne-auto',
      account: 'Compte principal',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      notes: `Versement sur ${goalTitle}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    try {
      const res = await api.savings.deposit(id, {
        amount: numericAmount,
        date: new Date().toISOString(),
      });
      if (res.success) {
        // Synchroniser uniquement l'ID réel de la transaction (remplacer tempId)
        // Ne PAS re-fetcher toute la liste pour ne pas écraser l'optimistic update
        const depositData = res.data?.deposit || res.data;
        const realTxId = depositData?.transaction?.id || depositData?.transactionId;
        if (realTxId) {
          setTransactions((prev) =>
            prev.map((t) => (t.id === tempTxId ? { ...t, id: realTxId } : t))
          );
        }
        // Synchroniser le currentAmount exact depuis le backend pour cet objectif seulement
        const goalId = id;
        const remoteGoalAmount = res.data?.goal?.currentAmount;
        if (typeof remoteGoalAmount === 'number') {
          setSavingsGoals((prev) =>
            prev.map((g) => (g.id === goalId ? { ...g, currentAmount: remoteGoalAmount } : g))
          );
        }
      }
    } catch (err) {
      console.warn('[WealthFlow API] Erreur lors du dépôt d\'épargne:', err);
      // En cas d'erreur, l'optimistic update reste visible (meilleure UX)
    }
  };

  const toggleGoalCheckbox = async (goalId: string, boxIndex: number) => {
    const targetGoal = savingsGoals.find((g) => g.id === goalId);
    if (!targetGoal) return;

    const checkedSet = new Set<number>(targetGoal.checkedBoxes || []);
    const wasChecked = checkedSet.has(boxIndex);
    const totalBoxes = targetGoal.checkboxesCount || 10;
    const unitValue = Math.round(targetGoal.targetAmount / totalBoxes);

    // Clé unique et balise déterministe pour éviter tout doublon
    const boxTag = `[palier:${goalId}:${boxIndex}]`;
    const tempTxId = `tx-box-${goalId}-${boxIndex}`;

    if (wasChecked) {
      checkedSet.delete(boxIndex);
    } else {
      checkedSet.add(boxIndex);
    }

    const updatedCheckedBoxes = Array.from(checkedSet);
    const diffCount = wasChecked ? -1 : 1;
    const deltaAmount = unitValue * diffCount;
    const newCurrentAmount = Math.min(
      targetGoal.targetAmount,
      Math.max(0, targetGoal.currentAmount + deltaAmount)
    );

    // 1. Mettre à jour immédiatement l'objectif d'épargne (optimistic update réactif)
    setSavingsGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== goalId) return goal;
        return {
          ...goal,
          checkedBoxes: updatedCheckedBoxes,
          currentAmount: newCurrentAmount,
        };
      })
    );

    // 2. Gestion de l'activité (Transaction)
    if (!wasChecked) {
      // ─── PALIER COCHÉ ───
      // Vérifier d'abord qu'il n'existe pas déjà une transaction pour ce palier
      const existingTx = transactions.find(
        (t) => t.id === tempTxId || (t.notes && t.notes.includes(boxTag))
      );

      if (!existingTx) {
        // Créer automatiquement une activité de type épargne
        const epargneCat =
          categories.find(
            (c) => c.name.toLowerCase().includes('épargne') || c.id === 'default-epargne-auto'
          ) || categories[0];
        const categoryId = epargneCat?.id || 'default-epargne-auto';
        const categoryName = epargneCat?.name || 'Épargne & Investissement';

        const newTx: Transaction = {
          id: tempTxId,
          title: `Épargne - ${targetGoal.title}`,
          amount: unitValue,
          type: 'savings_deposit',
          category: categoryName,
          categoryId,
          account: 'Compte principal',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          notes: `${boxTag} Palier ${boxIndex + 1} validé sur ${targetGoal.title}`,
        };

        // Ajouter la nouvelle activité en tête de liste
        setTransactions((prev) => [newTx, ...prev]);

        try {
          // Persister les cases cochées et enregistrer la transaction en backend
          const [updateRes, txRes] = await Promise.all([
            api.savings.update(goalId, { checkedBoxes: updatedCheckedBoxes }),
            api.transactions.create({
              title: newTx.title,
              amount: unitValue,
              type: 'savings_deposit',
              categoryId,
              date: newTx.date,
              time: newTx.time,
              notes: newTx.notes,
            }),
          ]);

          if (txRes?.success && txRes.data?.id) {
            const realTxId = txRes.data.id;
            setTransactions((prev) =>
              prev.map((t) => (t.id === tempTxId ? { ...t, id: realTxId } : t))
            );
          }
        } catch (err) {
          console.warn('[WealthFlow API] Erreur lors de la validation du palier:', err);
        }
      } else {
        // La transaction existe déjà, juste mettre à jour les cases cochées
        try {
          await api.savings.update(goalId, { checkedBoxes: updatedCheckedBoxes });
        } catch (err) {
          console.warn('[WealthFlow API] Erreur lors de la mise à jour des cases cochées:', err);
        }
      }
    } else {
      // ─── PALIER DÉCOCHÉ ───
      // Trouver la transaction correspondante avant suppression pour récupérer son ID backend éventuel
      const existingTx = transactions.find(
        (t) => t.id === tempTxId || (t.notes && t.notes.includes(boxTag))
      );

      // Supprimer immédiatement l'activité correspondante (éviter les montants fantômes)
      setTransactions((prev) =>
        prev.filter((t) => t.id !== tempTxId && (!t.notes || !t.notes.includes(boxTag)))
      );

      try {
        await api.savings.update(goalId, { checkedBoxes: updatedCheckedBoxes });

        // Supprimer la transaction en backend si elle existe
        if (existingTx) {
          // Supprimer uniquement si c'est un ID backend réel, pas temporaire
          if (!existingTx.id.startsWith('tx-box-')) {
            await api.transactions.delete(existingTx.id).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('[WealthFlow API] Erreur lors du retrait du palier:', err);
      }
    }
  };

  const toggleGoalAutoSave = async (goalId: string) => {
    let nextState = false;
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        nextState = !g.isAutoSaveActive;
        return { ...g, isAutoSaveActive: nextState };
      })
    );

    try {
      await api.savings.update(goalId, { isAutoSaveActive: nextState });
    } catch (err) {
      console.warn('[WealthFlow API] Erreur mise à jour épargne auto:', err);
    }
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

      const realCatId = res.data?.category?.id || res.data?.id;
      if (res.success && realCatId) {
        setCategories((prev) =>
          prev.map((c) => (c.id === tempId ? { ...c, id: realCatId } : c))
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
  const autoDistributeBudgets = async (incomeBase: number) => {
    const expenseCats = categories.filter((c) => c.type === 'expense');
    if (expenseCats.length === 0) return;

    // 70% of income allocated to expense categories
    const allocatable = Math.round(incomeBase * 0.7);
    const totalExistingLimits = expenseCats.reduce((s, c) => s + (c.budgetLimit || 1), 0);

    const updatedCategories = categories.map((c) => {
      if (c.type !== 'expense') return c;
      const weight = (c.budgetLimit || 1) / totalExistingLimits;
      return { ...c, budgetLimit: Math.round(allocatable * weight) };
    });

    setCategories(updatedCategories);

    // Synchroniser chaque limite de budget modifiée vers le backend Supabase
    for (const c of updatedCategories) {
      if (c.type === 'expense') {
        try {
          await api.categories.update(c.id, { budgetLimit: c.budgetLimit });
        } catch (err) {
          console.warn('[WealthFlow API] Erreur sync budget auto:', err);
        }
      }
    }
  };

  // Notification CRUD connecté à l'API Backend
  const addNotification = (notif: Omit<NotificationItem, 'id'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

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
      sessionStorage.setItem('wf_session_unlocked', 'true');
      if (previousTab) setActiveTab(previousTab);
      return true;
    }

    // Valide uniquement et strictement si le code correspond au mot de passe de compte
    const valid = Boolean(userProfile.pinCode && pin === userProfile.pinCode);
    if (valid) {
      setIsLocked(false);
      sessionStorage.setItem('wf_session_unlocked', 'true');
      if (previousTab) {
        setActiveTab(previousTab);
      }
      return true;
    }
    return false;
  };

  const lockApp = () => {
    setPreviousTab(activeTab);
    sessionStorage.removeItem('wf_session_unlocked');
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
    setTransactions([]);
    setSavingsGoals([]);
    setCategories([]);
    setNotifications([]);
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
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        chartData,
        isLocked,
        unlockWithPin,
        lockApp,
        changePin,
        isLoading,
        loadingMessage,
        simulateLoading,
        finishLoading,
        isDataLoading,
        dataLoadError,
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
