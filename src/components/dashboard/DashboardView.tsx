import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  Grid2X2,
  LineChart,
  Lock,
  Menu,
  PieChart,
  PiggyBank,
  Settings,
  Shield,
  TrendingUp,
  User,
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { BrandLogo } from '../common/BrandLogo';
import { BottomSheet } from '../common/BottomSheet';

export const DashboardView: React.FC = () => {
  const {
    totalBalance,
    totalIncome,
    totalExpenses,
    totalSaved,
    monthlyBudgetTotal,
    monthlyBudgetSpent,
    monthlyBudgetRemaining,
    transactions,
    categories,
    savingsGoals,
    chartData,
    notifications,
    userProfile,
    formatCurrency,
    activeTab,
    setActiveTab,
    setIsNewTransactionModalOpen,
    toggleGoalCheckbox,
    lockApp,
  } = useWealth();

  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'12' | '6' | '3'>('6');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const displayChartData =
    chartPeriod === '3'
      ? chartData.slice(-3)
      : chartPeriod === '6'
      ? chartData.slice(-6)
      : chartData;

  const primaryGoal = savingsGoals[0] || null;

  const goalProgress =
    primaryGoal && primaryGoal.targetAmount > 0
      ? Math.min(100, Math.round((primaryGoal.currentAmount / primaryGoal.targetAmount) * 100))
      : 0;
  const goalRemaining = primaryGoal ? Math.max(0, primaryGoal.targetAmount - primaryGoal.currentAmount) : 0;

  const budgetProgress = Math.min(
    100,
    monthlyBudgetTotal > 0 ? Math.round((monthlyBudgetSpent / monthlyBudgetTotal) * 100) : 0
  );

  const dailyAverageExpense = Math.round(totalExpenses / 30);
  const recentTransactions = transactions.slice(0, 5);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const firstName = userProfile.name?.split(' ')[0] || 'vous';

  // Sparkline (desktop only)
  const maxChartVal = Math.max(
    ...displayChartData.map((d) => Math.max(d.revenus, d.depenses, d.epargne)),
    2500000
  );
  const svgWidth = 400;
  const svgHeight = 110;
  const paddingX = 16;
  const paddingY = 16;
  const effectiveWidth = svgWidth - paddingX * 2;
  const effectiveHeight = svgHeight - paddingY * 2;

  const getPoints = (key: 'revenus' | 'depenses' | 'epargne') => {
    return displayChartData
      .map((d, index) => {
        const x = paddingX + (index / (displayChartData.length - 1)) * effectiveWidth;
        const y = svgHeight - paddingY - (d[key] / maxChartVal) * effectiveHeight;
        return `${x},${y}`;
      })
      .join(' ');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // LAYOUT MOBILE (< lg)
  // ─────────────────────────────────────────────────────────────────────────────
  const mobileDashboard = (
    <div className="flex flex-col min-h-screen bg-[#F7F7F7]">

      {/* ── HEADER GLASSMORPHISM ─────────────────────────────────── */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          
          {/* Menu Burger + Logo */}
          <div className="flex items-center gap-3">
            {/* Menu Burger */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="w-10 h-10 rounded-full bg-[#F7F7F7] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            >
              <Menu className="w-5 h-5 text-[#52525B]" />
            </button>
            
            {/* Logo */}
            <BrandLogo size="sm" />
          </div>

          {/* Actions droite */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative w-10 h-10 rounded-full bg-[#F7F7F7] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            >
              <Bell className="w-5 h-5 text-[#52525B]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF5330]" />
              )}
            </button>

            {/* Cadenas de verrouillage */}
            <button
              onClick={lockApp}
              className="w-10 h-10 rounded-full bg-[#F7F7F7] flex items-center justify-center cursor-pointer active:scale-95 hover:bg-[#E8E8E8] transition-all"
              title="Verrouiller l'espace"
            >
              <Lock className="w-5 h-5 text-[#52525B]" />
            </button>

            {/* Avatar / Profil */}
            <button
              onClick={() => setActiveTab('settings')}
              className="w-10 h-10 rounded-full bg-[#18181B] flex items-center justify-center cursor-pointer active:scale-95 transition-transform flex-shrink-0"
            >
              <span className="text-white text-xs font-black">
                {userProfile.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'WF'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── CONTENU PRINCIPAL ────────────────────────────────────── */}
      <main className="flex-1 px-4 pb-32 pt-5">

        {/* En-tête d'accueil */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#18181B] mb-1">
            Bonjour {firstName} 
          </h1>
          <p className="text-sm text-[#6F6F73]">
            Voyons où tu en es ce mois-ci.
          </p>
        </div>

        {/* ── CARTE SOLDE DISPONIBLE ──────────────────────────────── */}
        <div className="mb-5">
          <div className="rounded-2xl bg-[#18181B] text-white p-5 shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs text-white/60 font-medium mb-2">Solde disponible</p>
                <h2 className="text-3xl font-black tracking-tight text-white num-tabular">
                  {isBalanceHidden ? '••••••••' : formatCurrency(totalBalance)}
                </h2>
              </div>
              <button
                onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              >
                {isBalanceHidden ? (
                  <EyeOff className="w-4 h-4 text-white/70" />
                ) : (
                  <Eye className="w-4 h-4 text-white/70" />
                )}
              </button>
            </div>

            {/* Pourcentage du mois */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10B981]/20">
              <ArrowUpRight className="w-4 h-4 text-[#10B981]" />
              <span className="text-sm font-bold text-[#10B981]">+8,4% ce mois</span>
            </div>
          </div>
        </div>

        {/* ── CARD BUDGET ─────────────────────────────────────────── */}
        <div className="mb-5">
          <div className="rounded-2xl bg-white border border-[#E8E8E8] p-4 shadow-sm">
            <button
              onClick={() => setActiveTab('budget')}
              className="w-full text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF5330]/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[#FF5330]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#18181B]">Budget du mois</h3>
                    <p className="text-xs text-[#A1A1AA]">Suivi de vos dépenses</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#A1A1AA]" />
              </div>

              {/* Barre de progression */}
              <div className="w-full h-3 bg-[#F0F0F0] rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetProgress > 90 ? 'bg-[#EF4444]' : budgetProgress > 75 ? 'bg-[#F97316]' : 'bg-[#FF5330]'
                  }`}
                  style={{ width: `${budgetProgress}%` }}
                />
              </div>

              {/* Montants */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-black text-[#18181B] num-tabular">
                    {formatCurrency(monthlyBudgetSpent)}
                  </span>
                  <span className="text-sm text-[#A1A1AA] num-tabular"> / {formatCurrency(monthlyBudgetTotal)}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#10B981] num-tabular">
                    {formatCurrency(monthlyBudgetRemaining)}
                  </p>
                  <p className="text-xs text-[#A1A1AA]">{budgetProgress}% utilisé</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ── CARD ÉPARGNE ────────────────────────────────────────── */}
        <div className="mb-5">
          <div className="rounded-2xl bg-white border border-[#E8E8E8] p-4 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF5330]/10 flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-[#FF5330]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#18181B]">Épargne</h3>
                  <p className="text-xs text-[#A1A1AA]">Vos objectifs</p>
                </div>
              </div>
            </div>

            {/* Total épargné */}
            <p className="text-2xl font-black text-[#18181B] num-tabular mb-4">
              {formatCurrency(totalSaved)}
            </p>

            {/* Objectifs (max 2) */}
            <div className="space-y-3 mb-4">
              {savingsGoals.slice(0, 2).map((goal) => {
                const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-[#18181B]">{goal.title}</span>
                      <span className="text-sm font-black text-[#FF5330] num-tabular">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF5330] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {savingsGoals.length === 0 && (
                <p className="text-sm text-[#A1A1AA] text-center py-4">Aucun objectif en cours</p>
              )}
            </div>

            {/* Lien "Voir tous mes objectifs" */}
            <button
              onClick={() => setActiveTab('savings')}
              className="w-full text-center text-sm font-bold text-[#FF5330] py-2 flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
            >
              Voir tous mes objectifs
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── ACTIVITÉ RÉCENTE ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#18181B]">Activité récente</h3>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-sm font-bold text-[#FF5330] flex items-center gap-1 cursor-pointer"
            >
              Voir tout
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center bg-white rounded-2xl border border-[#E8E8E8]">
              <p className="text-sm text-[#A1A1AA] mb-3">Aucune transaction pour le moment</p>
              <button
                onClick={() => setIsNewTransactionModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#FF5330] text-white font-bold text-sm"
              >
                Ajouter une opération
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.slice(0, 5).map((tx) => {
                const isIncome = tx.type === 'income';
                const isSavings = tx.type === 'savings_deposit';
                const cat = categories.find(c => c.id === tx.categoryId);
                return (
                  <button
                    key={tx.id}
                    onClick={() => setActiveTab('transactions')}
                    className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-[#E8E8E8] cursor-pointer active:bg-[#FAFAFA] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isIncome ? 'bg-[#10B981]/10 text-[#10B981]'
                        : isSavings ? 'bg-[#FF5330]/10 text-[#FF5330]'
                        : 'bg-[#F7F7F7] text-[#52525B]'
                      }`}>
                        <CategoryIcon name={cat?.icon || tx.category} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-bold text-[#18181B] truncate">{tx.title}</p>
                        <p className="text-xs text-[#A1A1AA] truncate">{tx.category} · {tx.date}</p>
                      </div>
                    </div>
                    <p className={`text-base font-black num-tabular flex-shrink-0 ${
                      isIncome ? 'text-[#10B981]' : isSavings ? 'text-[#FF5330]' : 'text-[#18181B]'
                    }`}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* BottomSheet Menu */}
      <BottomSheet
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        title="Menu"
      >
        <div className="space-y-5 py-2">
          
          {/* Section Outils et Analyse */}
          <div>
            <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-3 px-1">
              Outils et Analyse
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { setActiveTab('analytics'); setIsMenuOpen(false); }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-[#FF5330]/10 text-[#FF5330]'
                    : 'bg-[#F7F7F7] text-[#52525B] active:bg-[#E8E8E8]'
                }`}
              >
                <BarChart3 className="w-6 h-6" />
                <span className="text-xs font-bold">Analyse</span>
              </button>

              <button
                onClick={() => { setActiveTab('strategy'); setIsMenuOpen(false); }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'strategy'
                    ? 'bg-[#FF5330]/10 text-[#FF5330]'
                    : 'bg-[#F7F7F7] text-[#52525B] active:bg-[#E8E8E8]'
                }`}
              >
                <LineChart className="w-6 h-6" />
                <span className="text-xs font-bold">Stratégie</span>
              </button>

              <button
                onClick={() => { setActiveTab('categories'); setIsMenuOpen(false); }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'categories'
                    ? 'bg-[#FF5330]/10 text-[#FF5330]'
                    : 'bg-[#F7F7F7] text-[#52525B] active:bg-[#E8E8E8]'
                }`}
              >
                <Grid2X2 className="w-6 h-6" />
                <span className="text-xs font-bold">Catégorie</span>
              </button>
            </div>
          </div>

          {/* Section Gestion et Sécurité */}
          <div>
            <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-3 px-1">
              Gestion et Sécurité
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { setActiveTab('notifications'); setIsMenuOpen(false); }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'notifications'
                    ? 'bg-[#FF5330]/10 text-[#FF5330]'
                    : 'bg-[#F7F7F7] text-[#52525B] active:bg-[#E8E8E8]'
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
                <span className="text-xs font-bold">Alerte</span>
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setIsMenuOpen(false); }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#FF5330]/10 text-[#FF5330]'
                    : 'bg-[#F7F7F7] text-[#52525B] active:bg-[#E8E8E8]'
                }`}
              >
                <Settings className="w-6 h-6" />
                <span className="text-xs font-bold">Réglage</span>
              </button>

              <button
                onClick={() => { setActiveTab('security'); setIsMenuOpen(false); }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'security'
                    ? 'bg-[#FF5330]/10 text-[#FF5330]'
                    : 'bg-[#F7F7F7] text-[#52525B] active:bg-[#E8E8E8]'
                }`}
              >
                <Shield className="w-6 h-6" />
                <span className="text-xs font-bold">Sécurité</span>
              </button>
            </div>
          </div>

        </div>
      </BottomSheet>

    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // LAYOUT DESKTOP (>= lg) — conservé tel quel
  // ─────────────────────────────────────────────────────────────────────────────
  const desktopDashboard = (
    <div id="dashboard-view" className="space-y-3 sm:space-y-4 animate-in fade-in duration-200">

      {/* En-tête d'accueil */}
      <div className="mb-1">
        <h1 className="text-lg font-black text-[#18181B] mb-0.5">
          Bonjour {firstName} 
        </h1>
        <p className="text-xs text-[#6F6F73]">
          Voyons où tu en es ce mois-ci.
        </p>
      </div>

      {/* 1. SOLDE DISPONIBLE */}
      <section
        id="section-solde-focal"
        className="rounded-xl bg-[#18181B] text-white p-2.5 sm:p-3 relative overflow-hidden shadow-sm"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-white/8 via-white/3 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none" />

        <div className="flex items-center justify-between mb-1 relative z-10">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/60">
              SEPTEMBRE 2026
            </span>
            <span className="w-1 h-1 rounded-full bg-[#10B981]" />
          </div>
          <button
            onClick={() => setIsBalanceHidden(!isBalanceHidden)}
            className="w-6 h-6 rounded-full bg-white/10 active:scale-95 flex items-center justify-center text-white/80 transition-all cursor-pointer"
          >
            {isBalanceHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="relative z-10 space-y-0.5">
          <p className="text-[11px] font-medium text-white/70">Solde disponible</p>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white num-tabular">
            {isBalanceHidden ? '••••••••' : formatCurrency(totalBalance)}
          </h2>
          <div className="flex items-center space-x-1.5 pt-0.5">
            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-[#10B981]/20 text-[#10B981]">
              <ArrowUpRight className="w-3 h-3" />
              <span>+8,4 %</span>
            </span>
            <span className="text-[11px] text-white/60">ce mois</span>
          </div>
        </div>
      </section>

      {/* 2. STATS COMPACTES */}
      <section id="section-stats-compact" className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-0.5">
          <div className="flex items-center space-x-1 text-[#6F6F73] text-[10px] font-semibold">
            <ArrowUpRight className="w-3 h-3 text-[#10B981]" />
            <span>Entrées</span>
          </div>
          <p className="text-xs sm:text-sm font-extrabold text-[#10B981] num-tabular truncate">
            {isBalanceHidden ? '••••' : `+${formatCurrency(totalIncome)}`}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-0.5">
          <div className="flex items-center space-x-1 text-[#6F6F73] text-[10px] font-semibold">
            <TrendingUp className="w-3 h-3 text-[#EF4444]" />
            <span>Dépenses</span>
          </div>
          <p className="text-xs sm:text-sm font-extrabold text-[#EF4444] num-tabular truncate">
            {isBalanceHidden ? '••••' : `-${formatCurrency(totalExpenses)}`}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-0.5">
          <div className="flex items-center space-x-1 text-[#6F6F73] text-[10px] font-semibold">
            <TrendingUp className="w-3 h-3 text-[#FF5330]" />
            <span>Moy./jour</span>
          </div>
          <p className="text-xs sm:text-sm font-extrabold text-[#18181B] num-tabular truncate">
            {isBalanceHidden ? '••••' : formatCurrency(dailyAverageExpense)}
          </p>
        </div>
      </section>

      {/* 3. BUDGET */}
      <section
        id="section-budget-mobile"
        onClick={() => setActiveTab('budget')}
        className="p-3 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-2 cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-[#FF5330]/10 flex items-center justify-center text-[#FF5330]">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-[#18181B]">Budget mensuel</h3>
              <p className="text-[10px] text-[#6F6F73]">Consommation globale</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-[#18181B] num-tabular">{budgetProgress}%</span>
            <span className="text-[10px] text-[#6F6F73] block">utilisé</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="w-full h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF5330] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${budgetProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-[#18181B] num-tabular">
            <span>{formatCurrency(monthlyBudgetSpent)} / {formatCurrency(monthlyBudgetTotal)}</span>
            <span className="text-[#10B981] font-extrabold">{formatCurrency(monthlyBudgetRemaining)} restants</span>
          </div>
        </div>
      </section>

      {/* 4. ÉPARGNE & TIRELIRE */}
      <section
        id="section-epargne-mobile"
        className="p-3 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-[#FF5330]/10 flex items-center justify-center text-[#FF5330]">
              <PiggyBank className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-[#18181B]">
                {primaryGoal ? primaryGoal.title : 'Épargne & Objectifs'}
              </h3>
              <p className="text-[10px] text-[#6F6F73]">
                {primaryGoal ? 'Tirelire & Objectif actif' : 'Aucun objectif en cours'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('savings')}
            className="text-xs font-bold text-[#FF5330] flex items-center space-x-0.5 cursor-pointer"
          >
            <span>{primaryGoal ? 'Détails' : 'Créer'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {primaryGoal ? (
          <>
            <div className="flex items-baseline justify-between pt-0.5">
              <p className="text-xs font-extrabold text-[#18181B] num-tabular">
                {formatCurrency(primaryGoal.currentAmount)} / {formatCurrency(primaryGoal.targetAmount)}
              </p>
              <span className="text-xs font-black text-[#FF5330] num-tabular">{goalProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF5330] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </>
        ) : (
          <p className="text-xs text-[#A1A1AA] pt-1">Définissez vos objectifs d'épargne pour suivre vos progrès.</p>
        )}
      </section>

      {/* 5. ACTIVITÉ RÉCENTE */}
      <section id="section-activite-recente" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-sm text-[#18181B]">Activité récente</h3>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-bold text-[#FF5330] flex items-center space-x-0.5 cursor-pointer"
          >
            <span>Voir tout</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="rounded-xl bg-white border border-[#E8E8E8] shadow-2xs divide-y divide-[#F0F0F0] overflow-hidden">
          {recentTransactions.length === 0 ? (
            <div className="p-6 text-center space-y-2">
              <p className="text-xs text-[#6F6F73]">Aucune transaction pour le moment.</p>
              <button
                onClick={() => setIsNewTransactionModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#FF5330] text-white font-bold text-xs"
              >
                Ajouter une opération
              </button>
            </div>
          ) : (
            recentTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isSavings = tx.type === 'savings_deposit';
              const cat = categories.find(c => c.id === tx.categoryId);
              return (
                <div
                  key={tx.id}
                  onClick={() => setActiveTab('transactions')}
                  className="p-3 flex items-center justify-between gap-3 active:bg-[#F4F4F5] transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isIncome ? 'bg-[#10B981]/10 text-[#10B981]'
                      : isSavings ? 'bg-[#FF5330]/10 text-[#FF5330]'
                      : 'bg-[#F7F7F7] text-[#18181B]'
                    }`}>
                      <CategoryIcon name={cat?.icon || tx.category} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-[#18181B] truncate">{tx.title}</p>
                      <p className="text-[10px] text-[#6F6F73] truncate mt-0.5">{tx.category} • {tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs sm:text-sm font-extrabold num-tabular ${
                      isIncome ? 'text-[#10B981]' : isSavings ? 'text-[#FF5330]' : 'text-[#18181B]'
                    }`}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <span className="text-[10px] text-[#A1A1AA]">{tx.account}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

    </div>
  );

  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden animate-in fade-in duration-200">
        {mobileDashboard}
      </div>
      {/* Desktop */}
      <div className="hidden lg:block animate-in fade-in duration-200">
        {desktopDashboard}
      </div>
    </>
  );
};
