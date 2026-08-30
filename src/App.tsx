import React, { useState, useEffect, useCallback } from 'react';
import { AppState, Category, SavingsGoal, Transaction, UserProfile, MonthlyBudget, AppNotification } from './types';
import { exportToCSV } from './utils/storage';
import { getCurrentMonthKey } from './utils/formatters';
import { calculateMonthSummary } from './utils/analytics';
import { Navbar } from './components/Navbar';
import { MobileHeader } from './components/MobileHeader';
import { MobileProfileMenu } from './components/MobileProfileMenu';
import { MobileBottomNav } from './components/MobileBottomNav';
import { FloatingActionButton } from './components/FloatingActionButton';
import { AddActionMenu } from './components/AddActionMenu';
import { WealthView } from './components/WealthView';
import { AddExpenseView } from './components/AddExpenseView';
import { GoalsView } from './components/GoalsView';
import { BudgetView } from './components/BudgetView';
import { TransactionsView } from './components/TransactionsView';
import { SettingsView } from './components/SettingsView';
import { CategoriesView } from './components/CategoriesView';
import { AnalyticsView } from './components/AnalyticsView';
import { InvestmentAdvisorView } from './components/InvestmentAdvisorView';
import { NotificationsModal } from './components/NotificationsModal';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { ConfirmModal } from './components/ConfirmModal';
import { RegisterView } from './components/RegisterView';
import { SecurityLockView } from './components/SecurityLockView';
import { useAuth } from './context/AuthContext';
import { transactionService } from './services/transactionService';
import { budgetService } from './services/budgetService';
import { categoryService } from './services/categoryService';
import { savingsService } from './services/savingsService';
import { userNotificationService } from './services/userNotificationService';
import { DEFAULT_CATEGORIES } from './utils/constants';

export default function App() {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout, updateProfile } = useAuth();

  // Core dynamic server-synced state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useState<Record<string, MonthlyBudget>>({});
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // App navigation and security lock
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(getCurrentMonthKey);
  const [currentTab, setCurrentTab] = useState<string>('wealth');

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'primary';
    icon?: 'trash' | 'warning' | 'edit';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Load authenticated user data from backend API
  const loadUserData = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsDataLoading(true);
    setFetchError(null);

    try {
      const [txList, catList, budgetMap, goalsList, notifList] = await Promise.all([
        transactionService.getTransactions().catch(() => []),
        categoryService.getCategories().catch(() => DEFAULT_CATEGORIES),
        budgetService.getBudgets().catch(() => ({})),
        savingsService.getSavingsGoals().catch(() => []),
        userNotificationService.getNotifications().catch(() => []),
      ]);

      setTransactions(txList);
      setCategories(catList.length > 0 ? catList : DEFAULT_CATEGORIES);
      setBudgets(budgetMap);
      setSavingsGoals(goalsList);
      setNotifications(notifList);
    } catch (err: any) {
      console.error('Failed to load user data:', err);
      setFetchError('Erreur de synchronisation avec le serveur.');
    } finally {
      setIsDataLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    } else {
      // Clear data on logout
      setTransactions([]);
      setCategories(DEFAULT_CATEGORIES);
      setBudgets({});
      setSavingsGoals([]);
      setNotifications([]);
    }
  }, [isAuthenticated, loadUserData]);

  // Sync theme with document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Aggregate AppState for view components
  const appState: AppState = {
    transactions,
    categories,
    budgets,
    savingsGoals,
    notifications,
    theme,
    userProfile: user || undefined,
  };

  // Current Month Summary calculation
  const summary = calculateMonthSummary(appState, currentMonthKey);

  // Notification actions
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await userNotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await userNotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await userNotificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Transaction CRUD
  const handleSaveTransaction = async (txData: Omit<Transaction, 'createdAt'> & { id?: string }) => {
    try {
      if (txData.id && transactions.some((t) => t.id === txData.id)) {
        const updated = await transactionService.updateTransaction(txData.id, txData);
        setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await transactionService.createTransaction(txData);
        setTransactions((prev) => [created, ...prev]);
      }
      setIsTxModalOpen(false);
      setEditingTransaction(null);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l’enregistrement de la transaction.');
    }
  };

  const handleDeleteTransaction = async (tx: Transaction) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Supprimer la transaction',
      message: `Voulez-vous vraiment supprimer cette opération de ${tx.amount.toLocaleString()} FCFA ?`,
      confirmLabel: 'Supprimer',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await transactionService.deleteTransaction(tx.id);
          setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          alert(err.message || 'Erreur lors de la suppression.');
        }
      },
    });
  };

  // Budget CRUD
  const handleSaveBudget = async (budgetData: {
    month: string;
    totalBudget: number;
    savingsTarget?: number;
    categoryBudgets?: Record<string, number>;
  }) => {
    try {
      const saved = await budgetService.upsertBudget(budgetData);
      setBudgets((prev) => ({
        ...prev,
        [saved.month]: saved,
      }));
      setIsBudgetModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l’enregistrement du budget.');
    }
  };

  // Savings Goal CRUD
  const handleSaveGoal = async (goalData: any) => {
    try {
      if (goalData.id && savingsGoals.some((g) => g.id === goalData.id)) {
        const updated = await savingsService.updateSavingsGoal(goalData.id, goalData);
        setSavingsGoals((prev) => prev.map((g) => (g.id === goalData.id ? updated : g)));
      } else {
        const created = await savingsService.createSavingsGoal(goalData);
        setSavingsGoals((prev) => [created, ...prev]);
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l’enregistrement de l’objectif d’épargne.');
    }
  };

  const handleContributeSavings = async (id: string, amount: number, milestoneId?: string) => {
    try {
      const updated = await savingsService.contributeSavings(id, amount, milestoneId);
      setSavingsGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la contribution à l’épargne.');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Supprimer l’objectif',
      message: 'Êtes-vous sûr de vouloir supprimer cet objectif d’épargne ?',
      confirmLabel: 'Supprimer',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await savingsService.deleteSavingsGoal(id);
          setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          alert(err.message || 'Erreur lors de la suppression.');
        }
      },
    });
  };

  // Category CRUD
  const handleSaveCategory = async (catData: any) => {
    try {
      if (catData.id && categories.some((c) => c.id === catData.id)) {
        const updated = await categoryService.updateCategory(catData.id, catData);
        setCategories((prev) => prev.map((c) => (c.id === catData.id ? updated : c)));
      } else {
        const created = await categoryService.createCategory(catData);
        setCategories((prev) => [...prev, created]);
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l’enregistrement de la catégorie.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Supprimer la catégorie',
      message: 'Voulez-vous vraiment supprimer cette catégorie personnalisée ?',
      confirmLabel: 'Supprimer',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await categoryService.deleteCategory(id);
          setCategories((prev) => prev.filter((c) => c.id !== id));
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          alert(err.message || 'Erreur lors de la suppression de la catégorie.');
        }
      },
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    exportToCSV(transactions, categories);
  };

  // User Profile Update
  const handleUpdateUser = async (updatedUser: UserProfile) => {
    try {
      await updateProfile(updatedUser);
    } catch (err: any) {
      alert(err.message || 'Erreur de mise à jour du profil.');
    }
  };

  // 1. Initial Loading Screen
  if (isAuthLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: 'var(--wf-bg)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse mb-4"
          style={{ background: 'var(--wf-primary)' }}
        >
          <span className="font-extrabold text-2xl">W</span>
        </div>
        <p className="text-sm font-semibold tracking-wide" style={{ color: 'var(--wf-text)' }}>
          Chargement de WealthFlow...
        </p>
      </div>
    );
  }

  // 2. Authentication Screen (Login / Register)
  if (!isAuthenticated) {
    return <RegisterView />;
  }

  // 3. Security PIN Lock Screen (if locked & user has PIN)
  if (isLocked && user?.hasPin) {
    return (
      <SecurityLockView
        user={user}
        onUnlock={() => setIsLocked(false)}
        onResetAccount={logout}
      />
    );
  }

  // Main Authenticated Application Views
  return (
    <div
      className="min-h-screen flex flex-col antialiased text-slate-900 transition-colors duration-200"
      style={{ background: 'var(--wf-bg)', color: 'var(--wf-text)' }}
    >
      {/* Desktop / Tablet Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentMonthKey={currentMonthKey}
        onChangeMonth={setCurrentMonthKey}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        userProfile={user || undefined}
        onLogout={logout}
      />

      {/* Mobile Top Header */}
      <MobileHeader
        currentTab={currentTab}
        currentMonthKey={currentMonthKey}
        onChangeMonth={setCurrentMonthKey}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        userProfile={user || undefined}
        onOpenProfileMenu={() => setIsProfileMenuOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {/* Sync loading indicator */}
        {isDataLoading && (
          <div className="mb-4 p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 text-xs font-semibold flex items-center justify-between animate-pulse">
            <span>Synchronisation des données cloud...</span>
          </div>
        )}

        {fetchError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold flex items-center justify-between">
            <span>{fetchError}</span>
            <button onClick={loadUserData} className="underline hover:no-underline ml-2">
              Réessayer
            </button>
          </div>
        )}

        {currentTab === 'wealth' && (
          <WealthView
            state={appState}
            summary={summary}
            currentMonthKey={currentMonthKey}
            onNavigateTab={setCurrentTab}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
          />
        )}

        {currentTab === 'add' && (
          <AddExpenseView
            state={appState}
            onSaveTransaction={handleSaveTransaction}
            onSuccess={() => setCurrentTab('wealth')}
          />
        )}

        {currentTab === 'history' && (
          <TransactionsView
            state={appState}
            currentMonthKey={currentMonthKey}
            onOpenTransactionModal={(tx) => {
              setEditingTransaction(tx || null);
              setIsTxModalOpen(true);
            }}
            onRequestDeleteTx={handleDeleteTransaction}
            onExportCSV={handleExportCSV}
          />
        )}

        {currentTab === 'budget' && (
          <BudgetView
            state={appState}
            currentMonthKey={currentMonthKey}
            summary={summary}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
          />
        )}

        {currentTab === 'goals' && (
          <GoalsView
            state={appState}
            onSaveGoal={handleSaveGoal}
            onContribute={handleContributeSavings}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            state={appState}
            currentMonthKey={currentMonthKey}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'invest' && (
          <InvestmentAdvisorView
            state={appState}
            currentMonthKey={currentMonthKey}
            summary={summary}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'categories' && (
          <CategoriesView
            state={appState}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            state={appState}
            userProfile={user || undefined}
            onUpdateUser={handleUpdateUser}
            onLogout={logout}
            onLockSession={() => setIsLocked(true)}
            onRestoreState={(newState) => {
              setTransactions(newState.transactions || []);
              setCategories(newState.categories || DEFAULT_CATEGORIES);
              setBudgets(newState.budgets || {});
              setSavingsGoals(newState.savingsGoals || []);
            }}
            onRequestConfirm={(cfg) => setConfirmConfig({ ...cfg, isOpen: true })}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Floating Action Button & Menu (Mobile) */}
      <FloatingActionButton isOpen={isAddMenuOpen} onToggle={() => setIsAddMenuOpen(!isAddMenuOpen)} />

      <AddActionMenu
        isOpen={isAddMenuOpen}
        onClose={() => setIsAddMenuOpen(false)}
        onSelectAction={(action) => {
          setIsAddMenuOpen(false);
          if (action === 'transaction') {
            setEditingTransaction(null);
            setIsTxModalOpen(true);
          } else if (action === 'budget') {
            setIsBudgetModalOpen(true);
          } else if (action === 'goal') {
            setCurrentTab('goals');
          }
        }}
      />

      {/* Mobile Profile Menu Modal */}
      <MobileProfileMenu
        isOpen={isProfileMenuOpen}
        onClose={() => setIsProfileMenuOpen(false)}
        userProfile={user || undefined}
        onSelectTab={(tab) => {
          setIsProfileMenuOpen(false);
          setCurrentTab(tab);
        }}
        onLogout={() => {
          setIsProfileMenuOpen(false);
          logout();
        }}
      />

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
        categories={categories}
      />

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentMonthKey={currentMonthKey}
        currentBudget={budgets[currentMonthKey]}
        categories={categories}
        onSave={handleSaveBudget}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationRead}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onDeleteNotification={handleDeleteNotification}
        onNavigateTab={(tab) => {
          setIsNotificationsOpen(false);
          setCurrentTab(tab);
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        cancelLabel={confirmConfig.cancelLabel}
        variant={confirmConfig.variant}
        icon={confirmConfig.icon}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
