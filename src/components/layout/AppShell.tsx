import React, { useEffect, useState } from 'react';
import { useWealth } from '../../context/WealthContext';
import { AdminView } from '../admin/AdminView';
import { AnalyticsView } from '../analytics/AnalyticsView';
import { AuthModal } from '../auth/AuthModal';
import { BudgetView } from '../budget/BudgetView';
import { CategoriesView } from '../categories/CategoriesView';
import { LoadingScreen } from '../common/LoadingScreen';
import { DashboardView } from '../dashboard/DashboardView';
import { HelpCenterView } from '../help/HelpCenterView';
import { LandingView } from '../landing/LandingView';
import { LegalView } from '../legal/LegalView';
import { MaintenanceScreen } from '../maintenance/MaintenanceScreen';
import { NewCategoryModal } from '../modals/NewCategoryModal';
import { NewGoalModal } from '../modals/NewGoalModal';
import { NewTransactionModal } from '../modals/NewTransactionModal';
import { NotificationsView } from '../notifications/NotificationsView';
import { SavingsView } from '../savings/SavingsView';
import { SecurityLockView } from '../security/SecurityLockView';
import { SettingsView } from '../settings/SettingsView';
import { StrategyView } from '../strategy/StrategyView';
import { TransactionsView } from '../transactions/TransactionsView';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { Sidebar } from './Sidebar';
import { api } from '../../services/api';

export const AppShell: React.FC = () => {
  const { activeTab, isLocked, isLoading, finishLoading, loadingMessage, currentRoute, isAuthenticated, isAdminAuthenticated, setActiveTab, addNotification } = useWealth();

  // Maintenance Mode — récupéré et synchronisé depuis l'API backend DB
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [maintenanceChecked, setMaintenanceChecked] = useState(false);

  const checkMaintenanceStatus = React.useCallback(() => {
    api.system
      .getSettings()
      .then((res) => {
        if (res.success && res.data) {
          const maintenance = Boolean(res.data.maintenanceMode);
          const msg = res.data.maintenanceMessage || '';
          setIsMaintenanceMode(maintenance);
          setMaintenanceMessage(msg);

          if (maintenance) {
            const flagKey = 'wf_maintenance_notif_sent';
            const alreadySent = localStorage.getItem(flagKey);
            if (!alreadySent) {
              addNotification({
                title: '🔧 Maintenance en cours',
                message: msg || 'WealthFlow est en cours de maintenance. Nous revenons très prochainement !',
                date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
                read: false,
                type: 'warning',
              });
              localStorage.setItem(flagKey, '1');
            }
          } else {
            localStorage.removeItem('wf_maintenance_notif_sent');
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setMaintenanceChecked(true);
      });
  }, [addNotification]);

  useEffect(() => {
    checkMaintenanceStatus();
    const interval = setInterval(checkMaintenanceStatus, 15000);
    return () => clearInterval(interval);
  }, [checkMaintenanceStatus, activeTab]);

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
      case 'help-center':
        return <HelpCenterView />;
      case 'legal':
        return <LegalView />;
      default:
        return <DashboardView />;
    }
  };

  // 1. Loading Screen
  if (isLoading) {
    return <LoadingScreen onFinished={finishLoading} message={loadingMessage} />;
  }

  // 2. Admin — vérifié AVANT tout le reste (accès indépendant, maintenance ignorée pour l'admin)
  if (isAdminAuthenticated && activeTab === 'admin') {
    return <AdminView />;
  }

  // 3. Mode maintenance (bloque tout utilisateur sauf administrateur)
  if (isMaintenanceMode && maintenanceChecked && !isAdminAuthenticated) {
    return (
      <MaintenanceScreen
        message={maintenanceMessage}
        onRefresh={() => window.location.reload()}
        onOpenHelp={() => setActiveTab('help-center')}
      />
    );
  }

  // 4. Landing Page (not authenticated or on landing route)
  if (!isAuthenticated || currentRoute === 'landing') {
    return (
      <>
        <LandingView />
        <AuthModal />
      </>
    );
  }

  // 4. Lock Screen (authenticated but locked)
  if (isLocked) {
    return (
      <>
        <SecurityLockView />
        <AuthModal />
      </>
    );
  }

  // 5. Admin depuis l'app connectée
  if (activeTab === 'admin') {
    // Vérifier le rôle réel de l'utilisateur
    if (!isAdminAuthenticated) {
      // Rediriger vers dashboard si l'utilisateur n'est pas admin
      setActiveTab('dashboard');
      return <DashboardView />;
    }
    return <AdminView />;
  }

  // 5. Main Application
  return (
    <div id="app-root" className="min-h-screen bg-[#F7F7F7] text-[#18181B] flex flex-col md:flex-row antialiased selection:bg-[#FF5330]/20 selection:text-[#18181B]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-0">
        {/* Header */}
        <Header />

        {/* Dynamic Page View Area
            Les vues mobiles (dashboard, transactions, budget, savings) gèrent leur propre padding.
            Les vues desktop et secondaires bénéficient du padding lg: ici.
        */}
        <main className="flex-1 w-full mx-auto max-w-4xl lg:px-6 lg:py-4 lg:pb-12">
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
