import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  Lightbulb,
  PiggyBank,
  Plus,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { CategoryIcon } from '../common/CategoryIcon';

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
    savingsGoals,
    chartData,
    formatCurrency,
    setActiveTab,
    setIsNewTransactionModalOpen,
    toggleGoalCheckbox,
  } = useWealth();

  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'12' | '6' | '3'>('6');

  // Filter chart data according to period
  const displayChartData =
    chartPeriod === '3'
      ? chartData.slice(-3)
      : chartPeriod === '6'
      ? chartData.slice(-6)
      : chartData;

  // Primary savings goal highlight
  const primaryGoal = savingsGoals[0] || {
    id: 'goal-1',
    title: 'Objectif Général',
    targetAmount: 1250000,
    currentAmount: 850000,
    checkboxesCount: 10,
    checkedBoxes: [0, 1, 2, 3, 4, 5, 6],
  };

  const goalProgress = Math.min(
    100,
    Math.round((primaryGoal.currentAmount / primaryGoal.targetAmount) * 100)
  );
  const goalRemaining = Math.max(0, primaryGoal.targetAmount - primaryGoal.currentAmount);

  // Budget calculations
  const budgetProgress = Math.min(
    100,
    monthlyBudgetTotal > 0 ? Math.round((monthlyBudgetSpent / monthlyBudgetTotal) * 100) : 0
  );

  // Daily average estimate (expenses / 30 days)
  const dailyAverageExpense = Math.round(totalExpenses / 30);

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  // Sparkline data for balance curve
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

  return (
    <div id="dashboard-view" className="space-y-3 sm:space-y-4 animate-in fade-in duration-200">
      
      {/* 1. CONTEXTE DU MOIS & SOLDE DISPONIBLE (FOCAL POINT) */}
      <section
        id="section-solde-focal"
        className="rounded-2xl sm:rounded-3xl bg-[#18181B] text-white p-4 sm:p-5 relative overflow-hidden shadow-sm"
      >
        {/* Subtle geometric light accent */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-white/10 via-white/5 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />

        {/* Month Context & Eye Toggle */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/60">
              SEPTEMBRE 2026
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          </div>

          <button
            onClick={() => setIsBalanceHidden(!isBalanceHidden)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white/80 transition-all cursor-pointer"
            title={isBalanceHidden ? 'Afficher le solde' : 'Masquer le solde'}
            aria-label="Afficher/masquer le solde"
          >
            {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Large Focal Balance Amount */}
        <div className="relative z-10 space-y-1">
          <p className="text-xs font-medium text-white/70">Solde disponible</p>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white num-tabular">
            {isBalanceHidden ? '••••••••' : formatCurrency(totalBalance)}
          </h2>

          <div className="flex items-center space-x-2 pt-1">
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[#10B981]/20 text-[#10B981]">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+8,4 %</span>
            </span>
            <span className="text-xs text-white/60">ce mois</span>
          </div>
        </div>

        {/* Subtle Trend Sparkline embedded */}
        <div className="mt-4 pt-3 border-t border-white/10 relative z-10">
          <div className="flex items-center justify-between mb-1 text-[11px] text-white/60">
            <span>Évolution des flux</span>
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-0.5 bg-[#10B981]" />
                <span className="text-[10px]">Entrées</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-0.5 bg-[#EF4444]" />
                <span className="text-[10px]">Dépenses</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-0.5 bg-[#FF5330]" />
                <span className="text-[10px]">Épargne</span>
              </span>
            </div>
          </div>

          <div className="w-full select-none">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-16 overflow-visible"
            >
              {/* Income Line */}
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={getPoints('revenus')}
              />
              {/* Expenses Line */}
              <polyline
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={getPoints('depenses')}
              />
              {/* Savings Line */}
              <polyline
                fill="none"
                stroke="#FF5330"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={getPoints('epargne')}
              />
            </svg>
          </div>
        </div>
      </section>

      {/* 2. STATISTIQUES COMPACTES (Entrées / Dépenses / Moyenne jour) */}
      <section id="section-stats-compact" className="grid grid-cols-3 gap-2">
        {/* Entrées */}
        <div className="p-2.5 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-0.5">
          <div className="flex items-center space-x-1 text-[#6F6F73] text-[10px] font-semibold">
            <ArrowUpRight className="w-3 h-3 text-[#10B981]" />
            <span>Entrées</span>
          </div>
          <p className="text-xs sm:text-sm font-extrabold text-[#10B981] num-tabular truncate">
            {isBalanceHidden ? '••••' : `+${formatCurrency(totalIncome)}`}
          </p>
        </div>

        {/* Dépenses */}
        <div className="p-2.5 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-0.5">
          <div className="flex items-center space-x-1 text-[#6F6F73] text-[10px] font-semibold">
            <ArrowDownRight className="w-3 h-3 text-[#EF4444]" />
            <span>Dépenses</span>
          </div>
          <p className="text-xs sm:text-sm font-extrabold text-[#EF4444] num-tabular truncate">
            {isBalanceHidden ? '••••' : `-${formatCurrency(totalExpenses)}`}
          </p>
        </div>

        {/* Moyenne / jour */}
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

      {/* 3. BUDGET MENSUEL (Compact & Clair) */}
      <section
        id="section-budget-mobile"
        onClick={() => setActiveTab('budget')}
        className="p-3 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-2 cursor-pointer hover:border-[#FF5330]/40 transition-colors"
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

        {/* Progress Bar in #FF5330 */}
        <div className="space-y-1">
          <div className="w-full h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF5330] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${budgetProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold text-[#18181B] num-tabular">
            <span>
              {formatCurrency(monthlyBudgetSpent)} / {formatCurrency(monthlyBudgetTotal)}
            </span>
            <span className="text-[#10B981] font-extrabold">
              {formatCurrency(monthlyBudgetRemaining)} restants
            </span>
          </div>
        </div>
      </section>

      {/* 4. ÉPARGNE & CASES DE LA TIRELIRE */}
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
                {primaryGoal.title}
              </h3>
              <p className="text-[10px] text-[#6F6F73]">Tirelire & Objectif actif</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('savings')}
            className="text-xs font-bold text-[#FF5330] hover:underline flex items-center space-x-0.5 cursor-pointer"
          >
            <span>Détails</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress Numbers */}
        <div className="flex items-baseline justify-between pt-0.5">
          <p className="text-xs font-extrabold text-[#18181B] num-tabular">
            {formatCurrency(primaryGoal.currentAmount)} / {formatCurrency(primaryGoal.targetAmount)}
          </p>
          <span className="text-xs font-black text-[#FF5330] num-tabular">{goalProgress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FF5330] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${goalProgress}%` }}
          />
        </div>

        {/* Interactive Checkboxes for Piggy Bank */}
        <div className="pt-0.5">
          <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
            Paliers de validation
          </p>
          <div className="flex items-center justify-between gap-1.5 overflow-x-auto py-0.5">
            {Array.from({ length: 8 }).map((_, idx) => {
              const isChecked = primaryGoal.checkedBoxes?.includes(idx) || idx < Math.floor((goalProgress / 100) * 8);

              return (
                <button
                  key={idx}
                  onClick={() => toggleGoalCheckbox(primaryGoal.id, idx)}
                  className={`flex-1 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                    isChecked
                      ? 'bg-[#FF5330] border-[#FF5330] text-white shadow-xs'
                      : 'bg-[#F7F7F7] border-[#E8E8E8] text-[#A1A1AA] hover:border-[#FF5330]/40'
                  }`}
                  title={`Palier ${idx + 1}`}
                >
                  {isChecked ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : (
                    <span className="text-[10px] font-black">{idx + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. ACTIVITÉ RÉCENTE (VRAIE LISTE MOBILE TACTILE) */}
      <section id="section-activite-recente" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-sm text-[#18181B]">Activité récente</h3>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-bold text-[#FF5330] hover:underline flex items-center space-x-0.5 cursor-pointer"
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

              return (
                <div
                  key={tx.id}
                  onClick={() => setActiveTab('transactions')}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-[#FAFAFA] active:bg-[#F4F4F5] transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isIncome
                          ? 'bg-[#10B981]/10 text-[#10B981]'
                          : isSavings
                          ? 'bg-[#FF5330]/10 text-[#FF5330]'
                          : 'bg-[#F7F7F7] text-[#18181B]'
                      }`}
                    >
                      <CategoryIcon name={tx.category} className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-[#18181B] truncate">
                        {tx.title}
                      </p>
                      <p className="text-[10px] text-[#6F6F73] truncate mt-0.5">
                        {tx.category} • {tx.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-xs sm:text-sm font-extrabold num-tabular ${
                        isIncome
                          ? 'text-[#10B981]'
                          : isSavings
                          ? 'text-[#FF5330]'
                          : 'text-[#18181B]'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </p>
                    <span className="text-[10px] text-[#A1A1AA]">{tx.account}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 6. CONSEIL STRATÉGIQUE DU JOUR */}
      <section
        id="section-conseil-strategique"
        onClick={() => setActiveTab('strategy')}
        className="p-3 rounded-xl bg-[#FFFBF9] border border-[#FF5330]/20 shadow-2xs space-y-1.5 cursor-pointer hover:border-[#FF5330]/40 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FF5330]/10 text-[#FF5330]">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Recommandation</span>
          </span>
          <span className="text-[11px] font-semibold text-[#10B981]">Score : 88/100</span>
        </div>

        <h4 className="font-extrabold text-xs sm:text-sm text-[#18181B] leading-snug">
          Votre rythme d'épargne est optimal ce mois-ci.
        </h4>
        <p className="text-xs text-[#6F6F73] leading-relaxed">
          En maintenant <strong>38%</strong> de capacité d'épargne, votre projet <em>Achat de voiture</em> sera finalisé 3 semaines avant l'échéance.
        </p>

        <div className="pt-0.5 flex items-center text-xs font-bold text-[#FF5330] space-x-1">
          <span>Découvrir la stratégie complète</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </section>

    </div>
  );
};
