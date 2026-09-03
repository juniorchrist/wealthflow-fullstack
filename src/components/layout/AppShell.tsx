import React from 'react';
import { useWealth } from '../../context/WealthContext';
import { AnalyticsView } from '../analytics/AnalyticsView';
import { AuthModal } from '../auth/AuthModal';
import { BudgetView } from '../budget/BudgetView';
import { CategoriesView } from '../categories/CategoriesView';
import { LoadingScreen } from '../common/LoadingScreen';
import { DashboardView } from '../dashboard/DashboardView';
import { LandingView } from '../landing/LandingView';
import { NewCategoryModal } from '../modals/NewCategoryModal';
import { NewGoalModal } from '../modals/NewGoalModal';
import { NewTransactionModal } from '../modals/NewTransactionModal';
import { NotificationsView } from '../notifications/NotificationsView';
import { SavingsView } from '../savings/SavingsView';
import { LockScreen } from '../security/LockScreen';
import { SettingsView } from '../settings/SettingsView';
import { StrategyView } from '../strategy/StrategyView';
import { TransactionsView } from '../transactions/TransactionsView';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { Sidebar } from './Sidebar';

export const AppShell: React.FC = () => {
  const { activeTab, isLocked, isLoading, finishLoading, loadingMessage, currentRoute, isAuthenticated } = useWealth();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'transactions':
        return <TransactionsView />;
      case 'budget':
        return <BudgetView />;
      case 'savings':
        return <SavingsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'strategy':
        return <StrategyView />;
      case 'categories':
        return <CategoriesView />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsView />;
      case 'security':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  // 1. Loading Screen
  if (isLoading) {
    return <LoadingScreen onFinished={finishLoading} message={loadingMessage} />;
  }

  // 2. Landing Page (not authenticated or on landing route)
  if (!isAuthenticated || currentRoute === 'landing') {
    return (
      <>
        <LandingView />
        <AuthModal />
      </>
    );
  }

  // 3. Lock Screen (authenticated but locked)
  if (isLocked) {
    return (
      <>
        <LockScreen />
        <AuthModal />
      </>
    );
  }

  // 4. Main Application
  return (
    <div id="app-root" className="min-h-screen bg-[#F7F7F7] text-[#18181B] flex flex-col md:flex-row antialiased selection:bg-[#FF5330]/20 selection:text-[#18181B]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-0">
        {/* Header */}
        <Header />

        {/* Dynamic Page View Area */}
        <main className="flex-1 px-3 sm:px-6 py-3 sm:py-4 max-w-4xl w-full mx-auto pb-24 md:pb-12">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Floating Glass Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Modals */}
      <NewTransactionModal />
      <NewGoalModal />
      <NewCategoryModal />
      <AuthModal />
    </div>
  );
};
