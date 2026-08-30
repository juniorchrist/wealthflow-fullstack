import React from 'react';
import { formatFCFA, formatMonthLabel } from '../utils/formatters';
import { CategoryIcon } from './ui/CategoryIcon';
import { ArrowUpRight, ArrowDownRight, TrendingUp, ChevronRight, BarChart3, Tag } from 'lucide-react';
import { AppState, MonthSummary } from '../types';

interface WealthViewProps {
  state: AppState;
  summary: MonthSummary;
  currentMonthKey: string;
  onNavigateTab?: (tab: string) => void;
  onOpenBudgetModal?: () => void;
}

export const WealthView: React.FC<WealthViewProps> = ({
  state,
  summary,
  currentMonthKey,
  onNavigateTab,
  onOpenBudgetModal,
}) => {
  const currentTransactions = state.transactions.filter((tx) =>
    tx.date.startsWith(currentMonthKey)
  );
  const recentTransactions = currentTransactions.slice(0, 5);
  const avgDaily = summary.totalExpense > 0 ? Math.round(summary.totalExpense / 30) : 0;
  const isOverBudget = summary.hasBudget && summary.totalExpense > summary.budget;

  return (
    <div className="wf-page animate-slideUp">
      {/* Header */}
      <div className="mb-5 md:mb-6">
        <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--wf-text-tertiary)' }}>
          {formatMonthLabel(currentMonthKey)}
        </p>
        <h1 className="wf-title-page">Vue d'ensemble</h1>
      </div>

      {/* Responsive 2-column layout on tablet & desktop */}
      <div className="flex flex-col md:flex-row gap-5 lg:gap-6 items-start">
        {/* Colonne gauche : Solde, Stats, Budget */}
        <div className="w-full md:flex-1 space-y-4">
          {/* Solde principal */}
          <div
            className="liquid-card p-5 sm:p-6"
            style={{
              background: 'linear-gradient(135deg, var(--wf-surface) 0%, rgba(240,235,225,0.45) 100%)',
            }}
          >
            <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--wf-text-tertiary)' }}>
              Solde disponible ce mois
            </p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <p className="wf-amount-display" style={{ color: 'var(--wf-text)' }}>
                {formatFCFA(summary.balance)}
              </p>
              {summary.totalIncome > summary.totalExpense && (
                <span
                  className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ color: 'var(--wf-success)', background: 'var(--wf-success-soft)' }}
                >
                  <ArrowUpRight size={13} strokeWidth={2.5} />
                  +{formatFCFA(summary.totalIncome - summary.totalExpense, { compact: true })}
                </span>
              )}
            </div>
          </div>

          {/* Stats : Entrées / Dépenses / Moy / Épargne */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="liquid-card p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--wf-success-soft)' }}
                >
                  <ArrowUpRight size={13} strokeWidth={2.5} style={{ color: 'var(--wf-success)' }} />
                </div>
                <p className="text-[11px] font-semibold" style={{ color: 'var(--wf-text-tertiary)' }}>
                  Entrées
                </p>
              </div>
              <p className="wf-amount-medium" style={{ color: 'var(--wf-success)' }}>
                {formatFCFA(summary.totalIncome, { compact: true })}
              </p>
            </div>

            <div className="liquid-card p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--wf-danger-soft)' }}
                >
                  <ArrowDownRight size={13} strokeWidth={2.5} style={{ color: 'var(--wf-danger)' }} />
                </div>
                <p className="text-[11px] font-semibold" style={{ color: 'var(--wf-text-tertiary)' }}>
                  Dépenses
                </p>
              </div>
              <p className="wf-amount-medium" style={{ color: 'var(--wf-text)' }}>
                {formatFCFA(summary.totalExpense, { compact: true })}
              </p>
            </div>

            <div className="liquid-card p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--wf-primary-soft)' }}
                >
                  <TrendingUp size={13} strokeWidth={2.5} style={{ color: 'var(--wf-primary)' }} />
                </div>
                <p className="text-[11px] font-semibold" style={{ color: 'var(--wf-text-tertiary)' }}>
                  Moy/jour
                </p>
              </div>
              <p className="wf-amount-medium" style={{ color: 'var(--wf-text)' }}>
                {formatFCFA(avgDaily, { compact: true })}
              </p>
            </div>

            <div className="liquid-card p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--wf-info-soft)' }}
                >
                  <TrendingUp size={13} strokeWidth={2.5} style={{ color: 'var(--wf-info)' }} />
                </div>
                <p className="text-[11px] font-semibold" style={{ color: 'var(--wf-text-tertiary)' }}>
                  Épargne
                </p>
              </div>
              <p className="wf-amount-medium" style={{ color: 'var(--wf-text)' }}>
                {summary.totalIncome > 0
                  ? `${Math.max(0, Math.round(((summary.totalIncome - summary.totalExpense) / summary.totalIncome) * 100))}%`
                  : '—'}
              </p>
            </div>
          </div>

          {/* Budget Card */}
          <div className="liquid-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] font-semibold mb-0.5" style={{ color: 'var(--wf-text-tertiary)' }}>
                  Budget mensuel
                </p>
                <p className="text-sm font-bold" style={{ color: 'var(--wf-text)' }}>
                  {formatFCFA(summary.totalExpense)} <span style={{ color: 'var(--wf-text-tertiary)' }}>/ {formatFCFA(summary.budget || 0)}</span>
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <span
                  className="text-base font-bold tabular-nums"
                  style={{ color: isOverBudget ? 'var(--wf-danger)' : 'var(--wf-primary)' }}
                >
                  {summary.budgetUsagePercent}%
                </span>
                {onOpenBudgetModal && (
                  <button
                    onClick={onOpenBudgetModal}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                    style={{
                      background: 'var(--wf-surface-soft)',
                      color: 'var(--wf-text-secondary)',
                      border: '1px solid var(--wf-border)',
                    }}
                  >
                    Modifier
                  </button>
                )}
              </div>
            </div>
            <div className="liquid-progress">
              <div
                className="liquid-progress-fill"
                style={{
                  width: `${Math.min(100, summary.budgetUsagePercent)}%`,
                  background: isOverBudget
                    ? 'var(--wf-danger)'
                    : summary.budgetUsagePercent >= 80
                    ? 'var(--wf-warning)'
                    : 'var(--wf-primary)',
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs" style={{ color: 'var(--wf-text-tertiary)' }}>
                {formatFCFA(summary.remainingBudget)} restants
              </p>
              {isOverBudget && (
                <p className="text-xs font-bold" style={{ color: 'var(--wf-danger)' }}>
                  Dépassement
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite : Transactions récentes */}
        <div className="w-full md:w-[320px] lg:w-[360px] space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="wf-title-section text-sm sm:text-base">Transactions récentes</h2>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('history')}
                className="flex items-center gap-1 text-xs font-bold transition-colors"
                style={{ color: 'var(--wf-primary)' }}
              >
                Voir tout
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {recentTransactions.map((tx) => {
                const category = state.categories.find((c) => c.id === tx.categoryId);
                return (
                  <div
                    key={tx.id}
                    className="liquid-card p-3 sm:p-3.5 flex items-center gap-3"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--wf-surface-soft)' }}
                    >
                      <CategoryIcon category={category} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold truncate" style={{ color: 'var(--wf-text)' }}>
                        {tx.note || category?.name || 'Sans intitulé'}
                      </p>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--wf-text-tertiary)' }}>
                        {category?.name}
                      </p>
                    </div>
                    <span
                      className="text-xs sm:text-sm font-bold tabular-nums flex-shrink-0"
                      style={{
                        color: tx.type === 'income' ? 'var(--wf-success)' : 'var(--wf-text)',
                      }}
                    >
                      {tx.type === 'income' ? '+' : '−'}{formatFCFA(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="liquid-card p-6 text-center">
              <p className="text-xs" style={{ color: 'var(--wf-text-tertiary)' }}>
                Aucune opération ce mois-ci
              </p>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('add')}
                  className="btn-primary mt-3 px-4 py-2 text-xs"
                >
                  Ajouter
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Discreet tools shortcut — mobile only (md:hidden keeps tablet/desktop unchanged) */}
      {onNavigateTab && (
        <div className="md:hidden mt-5">
          <div className="flex items-center justify-between mb-2 px-1">
            <span
              className="text-[10.5px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--wf-text-tertiary)' }}
            >
              Outils & Analyses
            </span>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="flex items-center text-[11px] font-bold"
              style={{ color: 'var(--wf-primary)' }}
            >
              Voir tout
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { tab: 'analytics', label: 'Analyses', Icon: BarChart3 },
              { tab: 'invest', label: 'Stratégie', Icon: TrendingUp },
              { tab: 'categories', label: 'Catégories', Icon: Tag },
            ].map((item) => (
              <button
                key={item.tab}
                onClick={() => onNavigateTab(item.tab)}
                className="liquid-card p-3 flex flex-col items-center gap-1.5 rounded-xl cursor-pointer active:scale-[0.98] transition-transform"
              >
                <item.Icon size={18} strokeWidth={1.9} style={{ color: 'var(--wf-primary)' }} />
                <span className="text-[11px] font-bold" style={{ color: 'var(--wf-text)' }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};