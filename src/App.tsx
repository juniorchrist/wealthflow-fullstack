import React, { useState, useEffect } from 'react';
import { AppState, Category, SavingsGoal, Transaction, UserProfile } from './types';
import {
  getInitialState,
  saveStateToStorage,
  exportToCSV,
  saveUserProfileToStorage,
  removeUserProfileFromStorage,
} from './utils/storage';
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
import { generateNotifications } from './services/notificationService';

export default function App() {
  const [state, setState] = useState<AppState>(getInitialState);
  const [isLocked, setIsLocked] = useState<boolean>(true);
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

  // User Auth Handlers
  const handleRegister = (newUser: UserProfile) => {
    saveUserProfileToStorage(newUser);
    setState((prev: AppState) => ({
      ...prev,
      userProfile: newUser,
    }));
    setIsLocked(false);
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    saveUserProfileToStorage(updatedUser);
    setState((prev: AppState) => ({
      ...prev,
      userProfile: updatedUser,
    }));
  };

  const handleLogout = () => {
    removeUserProfileFromStorage();
    setState((prev: AppState) => ({
      ...prev,
      userProfile: undefined,
    }));
    setIsLocked(true);
  };

  const handleResetAccount = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Réinitialiser le compte',
      message: 'Voulez-vous réinitialiser le compte pour créer un nouvel utilisateur ?',
      confirmLabel: 'Réinitialiser',
      variant: 'warning',
      onConfirm: () => {
        removeUserProfileFromStorage();
        setState((prev: AppState) => ({
          ...prev,
          userProfile: undefined,
        }));
        setIsLocked(true);
        setConfirmConfig((prev: typeof confirmConfig) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  // Keep notifications in sync with the data (single source of truth),
  // preserving read/dismissed state. Dependencies exclude notifications to
  // avoid a regeneration loop; the functional update reads latest state.
  useEffect(() => {
    setState((prev) => {
      const next = generateNotifications(prev, currentMonthKey);
      if (next.length === (prev.notifications?.length || 0) &&
          next.every((n, i) => n.id === prev.notifications?.[i]?.id && n.read === prev.notifications?.[i]?.read)) {
        return prev;
      }
      return { ...prev, notifications: next };
    });
  }, [state.transactions, state.budgets, state.savingsGoals, state.categories, currentMonthKey]);

  // Sync theme with document element (Default to clean white background)
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.theme]);

  // Current Month Summary calculation
  const summary = calculateMonthSummary(state, currentMonthKey);

  // Notification actions
  const unreadCount = (state.notifications || []).filter((n) => !n.read).length;

  const handleMarkNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications?.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  };

  const handleMarkAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications?.map((n) => ({ ...n, read: true })),
    }));
  };

  const handleDeleteNotification = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications?.filter((n) => n.id !== id),
    }));
  };

  const handleClearNotifications = () => {
    setState((prev) => ({ ...prev, notifications: [] }));
  };

  // Transaction Actions
  const handleOpenTransactionModal = (tx?: Transaction) => {
    setEditingTransaction(tx || null);
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setConfirmConfig({
        isOpen: true,
        title: 'Modifier la transaction',
        message: `Confirmez-vous la modification de cette transaction de ${txData.amount} FCFA ?`,
        confirmLabel: 'Enregistrer les modifications',
        variant: 'primary',
        icon: 'edit',
        onConfirm: () => {
          setState((prev: AppState) => ({
            ...prev,
            transactions: prev.transactions.map((tx) =>
              tx.id === existingId ? { ...tx, ...txData } : tx
            ),
          }));
          setIsTxModalOpen(false);
          setConfirmConfig((prev: typeof confirmConfig) => ({ ...prev, isOpen: false }));
        },
      });
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: Date.now(),
      };
      setState((prev: AppState) => ({
        ...prev,
        transactions: [newTx, ...prev.transactions],
      }));
      setIsTxModalOpen(false);
    }
  };

  const handleRequestDeleteTransaction = (tx: Transaction) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Supprimer la transaction',
      message: `Êtes-vous sûr de vouloir supprimer définitivement cette transaction de ${tx.amount} FCFA (${tx.note || 'Sans description'}) ?`,
      confirmLabel: 'Supprimer',
      variant: 'danger',
      icon: 'trash',
      onConfirm: () => {
        setState((prev: AppState) => ({
          ...prev,
          transactions: prev.transactions.filter((item) => item.id !== tx.id),
        }));
        setConfirmConfig((prev: typeof confirmConfig) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Budget Actions
  const handleSaveBudget = (
    month: string,
    totalBudget: number,
    createSavingsPlan: boolean,
    savingsTargetAmount: number,
    categoryBudgets?: Record<string, number>
  ) => {
    setState((prev: AppState) => {
      const nextBudgets = {
        ...prev.budgets,
        [month]: {
          month,
          totalBudget,
          savingsTarget: createSavingsPlan ? savingsTargetAmount : undefined,
          categoryBudgets: categoryBudgets ?? prev.budgets[month]?.categoryBudgets,
          createdAt: prev.budgets[month]?.createdAt || Date.now(),
          updatedAt: Date.now(),
        },
      };

      let nextSavingsGoals = [...prev.savingsGoals];

      if (createSavingsPlan && savingsTargetAmount > 0) {
        const existingIndex = nextSavingsGoals.findIndex((g) => g.month === month);
        const splitAmount = Math.round(savingsTargetAmount / 4);
        const weeklyMilestones = Array.from({ length: 4 }, (_, i) => ({
          id: `ms-${month}-${i + 1}`,
          title: `Semaine ${i + 1}`,
          targetAmount: i === 3 ? savingsTargetAmount - splitAmount * 3 : splitAmount,
          isCompleted: false,
          completedAt: null,
        }));

        const goalObj: SavingsGoal = {
          id: existingIndex >= 0 ? nextSavingsGoals[existingIndex].id : `goal-${month}`,
          month,
          title: `Current Objective`,
          targetAmount: savingsTargetAmount,
          currentAmount: 0,
          milestones:
            existingIndex >= 0 ? nextSavingsGoals[existingIndex].milestones : weeklyMilestones,
          createdAt: Date.now(),
        };

        if (existingIndex >= 0) {
          nextSavingsGoals[existingIndex] = goalObj;
        } else {
          nextSavingsGoals = [goalObj, ...nextSavingsGoals];
        }
      }

      return {
        ...prev,
        budgets: nextBudgets,
        savingsGoals: nextSavingsGoals,
      };
    });

    setIsBudgetModalOpen(false);
  };

  // Allocate to vault
  const handleAllocateSavings = (amount: number) => {
    setState((prev: AppState) => {
      if (prev.savingsGoals.length === 0) {
        const newGoal: SavingsGoal = {
          id: `goal-${Date.now()}`,
          month: 'global',
          title: 'Vault',
          targetAmount: 1000000,
          currentAmount: amount,
          milestones: [],
          createdAt: Date.now(),
        };
        return {
          ...prev,
          savingsGoals: [newGoal, ...prev.savingsGoals],
        };
      }

      const currentGoal = prev.savingsGoals[0];
      const updatedGoal: SavingsGoal = {
        ...currentGoal,
        currentAmount: currentGoal.currentAmount + amount,
      };

      return {
        ...prev,
        savingsGoals: [updatedGoal, ...prev.savingsGoals.slice(1)],
      };
    });
  };

  // Milestone toggle
  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    setState((prev: AppState) => {
      const goalIndex = prev.savingsGoals.findIndex((g) => g.id === goalId);
      if (goalIndex === -1) return prev;

      const goal = prev.savingsGoals[goalIndex];
      const milestoneIndex = goal.milestones.findIndex((m) => m.id === milestoneId);
      if (milestoneIndex === -1) return prev;

      const milestone = goal.milestones[milestoneIndex];
      const isCompleting = !milestone.isCompleted;

      const updatedMilestones = [...goal.milestones];
      updatedMilestones[milestoneIndex] = {
        ...milestone,
        isCompleted: isCompleting,
        completedAt: isCompleting ? new Date().toISOString() : null,
      };

      const updatedGoal: SavingsGoal = {
        ...goal,
        milestones: updatedMilestones,
        currentAmount: isCompleting
          ? goal.currentAmount + milestone.targetAmount
          : Math.max(0, goal.currentAmount - milestone.targetAmount),
      };

      const updatedGoals = [...prev.savingsGoals];
      updatedGoals[goalIndex] = updatedGoal;

      return {
        ...prev,
        savingsGoals: updatedGoals,
      };
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    exportToCSV(state.transactions, state.categories);
  };

  // Category Actions
  const handleSaveCategory = (newCat: Category) => {
    setState((prev) => {
      const exists = prev.categories.some((c) => c.id === newCat.id);
      return {
        ...prev,
        categories: exists
          ? prev.categories.map((c) => (c.id === newCat.id ? newCat : c))
          : [...prev.categories, newCat],
      };
    });
  };

  const handleDeleteCategory = (catId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Supprimer la catégorie',
      message:
        'Êtes-vous sûr de vouloir supprimer cette catégorie ? Les transactions déjà créées conserveront leur référence.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
      icon: 'trash',
      onConfirm: () => {
        setState((prev: AppState) => ({
          ...prev,
          categories: prev.categories.filter((c) => c.id !== catId),
        }));
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleToggleCategory = (catId: string) => {
    setState((prev: AppState) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === catId ? { ...c, isActive: !(c.isActive ?? true) } : c
      ),
    }));
  };

  // If no user profile exists, display RegisterView
  if (!state.userProfile) {
    return <RegisterView onRegister={handleRegister} />;
  }

  // If user exists and screen is locked, display SecurityLockView
  if (isLocked) {
    return (
      <SecurityLockView
        user={state.userProfile}
        onUnlock={() => setIsLocked(false)}
        onResetAccount={handleResetAccount}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 overflow-x-hidden" style={{ background: 'var(--wf-bg)' }}>
      {/* Desktop Sidebar Navigation */}
      <div className="hidden md:block">
        <Navbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenSettings={() => setCurrentTab('settings')}
          user={state.userProfile}
          onLock={() => setIsLocked(true)}
          unreadCount={unreadCount}
        />
      </div>

      {/* Mobile Header */}
      <MobileHeader
        user={state.userProfile}
        onOpenProfile={() => setIsProfileMenuOpen(true)}
        onOpenSettings={() => setCurrentTab('settings')}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onLock={() => setIsLocked(true)}
        unreadCount={unreadCount}
      />

      {/* Main Content Area — sidebar offset on desktop */}
      <main className="flex-1 min-w-0 md:pl-[72px] lg:pl-64 flex flex-col">
        {/* Screen 1: Wealth Tab */}
        {currentTab === 'wealth' && (
          <WealthView
            state={state}
            summary={summary}
            currentMonthKey={currentMonthKey}
            onNavigateTab={setCurrentTab}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
          />
        )}

        {/* Screen: Add Expense Tab */}
        {currentTab === 'add' && (
          <AddExpenseView
            state={state}
            onSaveTransaction={handleSaveTransaction}
            onNavigateTab={setCurrentTab}
            onOpenTransactionModal={handleOpenTransactionModal}
          />
        )}

        {/* Screen: History/Transactions Tab */}
        {currentTab === 'history' && (
          <TransactionsView
            state={state}
            currentMonthKey={currentMonthKey}
            onOpenTransactionModal={handleOpenTransactionModal}
            onRequestDeleteTx={handleRequestDeleteTransaction}
            onExportCSV={handleExportCSV}
          />
        )}

        {/* Screen: Budget Tab */}
        {currentTab === 'budget' && (
          <BudgetView
            state={state}
            currentMonthKey={currentMonthKey}
            summary={summary}
            onChangeMonth={setCurrentMonthKey}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
          />
        )}


        {/* Screen: Goals/Epargne Tab */}
        {currentTab === 'goals' && (
          <GoalsView
            state={state}
            currentMonthKey={currentMonthKey}
            summary={summary}
            onAllocateSavings={handleAllocateSavings}
            onToggleMilestone={handleToggleMilestone}
          />
        )}

        {/* Screen: Categories Tab */}
        {currentTab === 'categories' && (
          <CategoriesView
            state={state}
            onNavigateTab={setCurrentTab}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
            onToggleCategory={handleToggleCategory}
          />
        )}

        {/* Screen: Analytics Tab */}
        {currentTab === 'analytics' && (
          <AnalyticsView
            state={state}
            currentMonthKey={currentMonthKey}
            summary={summary}
          />
        )}

        {/* Screen: Investment Advisor Tab */}
        {currentTab === 'invest' && (
          <InvestmentAdvisorView
            state={state}
            currentMonthKey={currentMonthKey}
            summary={summary}
            onNavigateTab={setCurrentTab}
          />
        )}

        {/* Screen: Settings Tab */}
        {currentTab === 'settings' && (
          <SettingsView
            state={state}
            userProfile={state.userProfile}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
            onResetAccount={handleResetAccount}
            onRestoreState={(newState) => setState(newState)}
            onResetData={() => {
              setState((prev) => ({
                ...prev,
                transactions: [],
                savingsGoals: [],
                budgets: {},
              }));
            }}
            onLockSession={() => setIsLocked(true)}
            onRequestConfirm={(config) => {
              setConfirmConfig({
                isOpen: true,
                title: config.title,
                message: config.message,
                confirmLabel: config.confirmLabel,
                variant: config.variant,
                onConfirm: () => {
                  config.onConfirm();
                  setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
                },
              });
            }}
          />
        )}
      </main>

      {/* Modals */}
      {isTxModalOpen && (
        <TransactionModal
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          onSave={handleSaveTransaction}
          editingTransaction={editingTransaction}
          state={state}
        />
      )}

      {isBudgetModalOpen && (
        <BudgetModal
          isOpen={isBudgetModalOpen}
          onClose={() => setIsBudgetModalOpen(false)}
          onSave={handleSaveBudget}
          currentMonthKey={currentMonthKey}
          state={state}
        />
      )}

      {isNotificationsOpen && (
        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          state={state}
          summary={summary}
          onNavigateTab={setCurrentTab}
          notifications={state.notifications}
          onMarkRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onDelete={handleDeleteNotification}
          onClearAll={handleClearNotifications}
        />
      )}

      {confirmConfig.isOpen && (
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          onClose={() => setConfirmConfig((prev: typeof confirmConfig) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmConfig.onConfirm}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmLabel={confirmConfig.confirmLabel}
          cancelLabel={confirmConfig.cancelLabel}
          variant={confirmConfig.variant}
          icon={confirmConfig.icon}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => setIsAddMenuOpen(true)}
        ariaLabel="Ajouter"
      />

      {/* Add Action Menu */}
      <AddActionMenu
        isOpen={isAddMenuOpen}
        onClose={() => setIsAddMenuOpen(false)}
        onSelectAction={(action) => {
          if (action === 'expense' || action === 'income') {
            setCurrentTab('add');
          }
          // Handle other actions as needed
        }}
      />

      {/* Mobile Profile Menu (mobile-only, opens from avatar) */}
      <MobileProfileMenu
        isOpen={isProfileMenuOpen}
        onClose={() => setIsProfileMenuOpen(false)}
        user={state.userProfile}
        unreadCount={unreadCount}
        onNavigate={setCurrentTab}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onLock={() => setIsLocked(true)}
      />
    </div>
  );
}
