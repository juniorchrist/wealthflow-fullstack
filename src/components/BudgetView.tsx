import React from 'react';
import { ChevronLeft, ChevronRight, TrendingDown, Wallet, AlertCircle } from 'lucide-react';
import { AppState, MonthSummary } from '../types';
import { formatFCFA, formatMonthLabel, getAdjacentMonth } from '../utils/formatters';
import { CategoryIcon } from './ui/CategoryIcon';
import { getCategoryBreakdown } from '../utils/analytics';

interface BudgetViewProps {
  state: AppState;
  currentMonthKey: string;
  summary: MonthSummary;
  onChangeMonth?: (month: string) => void;
  onOpenBudgetModal: () => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  state,
  currentMonthKey,
  summary,
  onChangeMonth,
  onOpenBudgetModal,
}) => {
  const definedBudget = summary.budget;
  const currentSpending = summary.totalExpense;
  const hasBudget = summary.hasBudget;
  const remaining = summary.remainingBudget;
  const usedPercent = summary.budgetUsagePercent;
  const isOverBudget = hasBudget && currentSpending > definedBudget;

  const categoryBreakdown = getCategoryBreakdown(state, currentMonthKey);
  const categoryBudgets = summary.hasBudget
    ? state.budgets[currentMonthKey]?.categoryBudgets || {}
    : {};

  const handlePrevMonth = () => {
    if (onChangeMonth) onChangeMonth(getAdjacentMonth(currentMonthKey, -1));
  };
  const handleNextMonth = () => {
    if (onChangeMonth) onChangeMonth(getAdjacentMonth(currentMonthKey, 1));
  };

  return (
    <div className="wf-page animate-slideUp">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 md:mb-6 flex-wrap gap-3">
        <div>
          <h1 className="wf-title-page">Budget</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--wf-text-secondary)' }}>
            Suivi des dépenses pour {formatMonthLabel(currentMonthKey)}
          </p>
        </div>

        {/* Month Navigator */}
        <div
          className="flex items-center justify-between p-1.5 rounded-xl gap-2"
          style={{
            background: 'var(--wf-surface)',
            border: '1px solid var(--wf-border)',
          }}
        >
          <button
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors touch-target"
            style={{ color: 'var(--wf-text-secondary)', background: 'var(--wf-surface-soft)' }}
            aria-label="Mois précédent"
          >
            <ChevronLeft size={15} strokeWidth={2} />
          </button>
          <span className="text-xs font-bold px-2" style={{ color: 'var(--wf-text)' }}>
            {formatMonthLabel(currentMonthKey)}
          </span>
          <button
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors touch-target"
            style={{ color: 'var(--wf-text-secondary)', background: 'var(--wf-surface-soft)' }}
            aria-label="Mois suivant"
          >
            <ChevronRight size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Responsive 2-column layout on tablet & desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-start">
        {/* Colonne gauche : Carte de Budget Principal */}
        <div className="liquid-card p-5 sm:p-6 space-y-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--wf-text-tertiary)' }}>
                Budget alloué
              </span>
              <span className="wf-amount-display" style={{ color: 'var(--wf-text)' }}>
                {hasBudget ? formatFCFA(definedBudget) : 'Non configuré'}
              </span>
            </div>
            <button
              onClick={onOpenBudgetModal}
              className="btn-primary px-3.5 py-2 text-xs font-semibold flex-shrink-0 touch-target"
            >
              {hasBudget ? 'Modifier' : 'Configurer'}
            </button>
          </div>

          {hasBudget ? (
            <div className="space-y-4 pt-1">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                  <span className="font-semibold" style={{ color: 'var(--wf-text-secondary)' }}>
                    Consommation
                  </span>
                  <span
                    className="font-bold tabular-nums"
                    style={{ color: isOverBudget ? 'var(--wf-danger)' : 'var(--wf-primary)' }}
                  >
                    {usedPercent}%
                  </span>
                </div>
                <div className="liquid-progress">
                  <div
                    className="liquid-progress-fill"
                    style={{
                      width: `${Math.min(100, usedPercent)}%`,
                      background: isOverBudget
                        ? 'var(--wf-danger)'
                        : usedPercent >= 80
                        ? 'var(--wf-warning)'
                        : 'var(--wf-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Dépensé / Disponible */}
              <div className="grid grid-cols-2 gap-2.5">
                <div
                  className="p-3.5 rounded-xl"
                  style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingDown size={13} strokeWidth={2} style={{ color: 'var(--wf-text-tertiary)' }} />
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--wf-text-tertiary)' }}>
                      Dépensé
                    </span>
                  </div>
                  <span className="text-base font-bold block tabular-nums" style={{ color: 'var(--wf-text)' }}>
                    {formatFCFA(currentSpending)}
                  </span>
                </div>

                <div
                  className="p-3.5 rounded-xl"
                  style={{
                    background: remaining >= 0 ? 'var(--wf-success-soft)' : 'var(--wf-danger-soft)',
                    border: `1px solid ${remaining >= 0 ? 'rgba(46,125,50,0.2)' : 'rgba(211,47,47,0.2)'}`,
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {remaining >= 0 ? (
                      <Wallet size={13} strokeWidth={2} style={{ color: 'var(--wf-success)' }} />
                    ) : (
                      <AlertCircle size={13} strokeWidth={2} style={{ color: 'var(--wf-danger)' }} />
                    )}
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: remaining >= 0 ? 'var(--wf-success)' : 'var(--wf-danger)' }}
                    >
                      {remaining >= 0 ? 'Disponible' : 'Dépassement'}
                    </span>
                  </div>
                  <span
                    className="text-base font-bold block tabular-nums"
                    style={{ color: remaining >= 0 ? 'var(--wf-success)' : 'var(--wf-danger)' }}
                  >
                    {formatFCFA(Math.abs(remaining))}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="py-6 text-center rounded-xl p-4"
              style={{ background: 'var(--wf-surface-soft)', border: '1px dashed var(--wf-border)' }}
            >
              <p className="text-xs mb-3" style={{ color: 'var(--wf-text-secondary)' }}>
                Définissez un budget pour suivre vos dépenses mois par mois.
              </p>
              <button onClick={onOpenBudgetModal} className="btn-primary px-4 py-2 text-xs">
                Configurer mon budget
              </button>
            </div>
          )}
        </div>

        {/* Colonne droite : Répartition par catégorie */}
        <div className="space-y-3">
          <h2 className="wf-title-section text-sm sm:text-base">
            Répartition par catégorie
          </h2>

          {categoryBreakdown.length > 0 ? (
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {categoryBreakdown.map((item) => {
                const cat = state.categories.find((c) => c.id === item.categoryId);
                const catBudget = categoryBudgets[item.categoryId];
                const hasCatBudget = typeof catBudget === 'number' && catBudget > 0;
                const catAvailable = hasCatBudget ? catBudget - item.amount : undefined;
                const catOver = hasCatBudget && item.amount > catBudget;

                return (
                  <div key={item.categoryId} className="liquid-card p-3.5">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CategoryIcon category={cat} className="w-8 h-8 rounded-lg flex-shrink-0" />
                        <span
                          className="text-xs sm:text-sm font-semibold truncate"
                          style={{ color: 'var(--wf-text)' }}
                        >
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {hasCatBudget && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              color: catOver ? 'var(--wf-danger)' : 'var(--wf-warning)',
                              background: catOver ? 'var(--wf-danger-soft)' : 'var(--wf-warning-soft)',
                            }}
                          >
                            {Math.min(100, Math.round((item.amount / catBudget) * 100))}%
                          </span>
                        )}
                        <span
                          className="text-xs sm:text-sm font-bold tabular-nums"
                          style={{ color: 'var(--wf-text)' }}
                        >
                          {formatFCFA(item.amount)}
                        </span>
                      </div>
                    </div>
                    <div className="liquid-progress">
                      <div
                        className="liquid-progress-fill"
                        style={{
                          width: `${Math.min(100, item.percentage)}%`,
                          background: hasCatBudget && catOver ? 'var(--wf-danger)' : undefined,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px]" style={{ color: 'var(--wf-text-tertiary)' }}>
                        {item.percentage}% du total
                      </span>
                      {hasCatBudget && (
                        <span
                          className="text-[11px] font-bold tabular-nums"
                          style={{ color: catOver ? 'var(--wf-danger)' : 'var(--wf-success)' }}
                        >
                          {catOver
                            ? `Dépassement ${formatFCFA(Math.abs(catAvailable!))}`
                            : `${formatFCFA(catAvailable)} restant`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="liquid-card p-6 text-center">
              <p className="text-xs" style={{ color: 'var(--wf-text-tertiary)' }}>
                Aucune dépense catégorisée pour ce mois
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};