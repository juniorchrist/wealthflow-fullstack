import React, { useState, useEffect } from 'react';
import { X, PiggyBank, Tag } from 'lucide-react';
import { formatFCFA, formatMonthLabel } from '../utils/formatters';
import { AppState } from '../types';
import { CategoryIcon } from './ui/CategoryIcon';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  state?: AppState;
  currentMonthKey?: string;
  monthKey?: string;
  currentBudget?: number;
  currentSavingsTarget?: number;
  onSave?: (budgetData: {
    month: string;
    totalBudget: number;
    savingsTarget?: number;
    categoryBudgets?: Record<string, number>;
  }) => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  state,
  currentMonthKey: propCurrentMonthKey,
  monthKey: propMonthKey,
  currentBudget: propCurrentBudget,
  currentSavingsTarget: propSavingsTarget,
  onSave,
}) => {
  const effectiveMonthKey = propCurrentMonthKey || propMonthKey || '';
  const existingBudget =
    propCurrentBudget !== undefined
      ? propCurrentBudget
      : state?.budgets[effectiveMonthKey]?.totalBudget || 0;

  const [budgetAmount, setBudgetAmount] = useState<string>('');
  const [enableSavingsPlan, setEnableSavingsPlan] = useState<boolean>(true);
  const [savingsPercentage, setSavingsPercentage] = useState<number>(15);
  const [error, setError] = useState<string>('');

  // Per-category budgets: categoryId -> string amount
  const expenseCategories = (state?.categories || []).filter(
    (c) => (c.type === 'expense' || c.type === 'both') && (c.isActive ?? true)
  );
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setBudgetAmount(existingBudget > 0 ? existingBudget.toString() : '');
      const existing = state?.budgets[effectiveMonthKey];
      const existingSavingsTarget = propSavingsTarget ?? existing?.savingsTarget;
      setEnableSavingsPlan(typeof existingSavingsTarget === 'number' && existingSavingsTarget > 0);
      if (typeof existingSavingsTarget === 'number' && existingSavingsTarget > 0) {
        const pct =
          existingBudget > 0
            ? Math.round((existingSavingsTarget / existingBudget) * 100)
            : 15;
        setSavingsPercentage(pct >= 1 && pct <= 100 ? pct : 15);
      } else {
        setSavingsPercentage(15);
      }
      setError('');
      const catBudgets = existing?.categoryBudgets || {};
      const catMap: Record<string, string> = {};
      expenseCategories.forEach((c) => {
        const val = catBudgets[c.id];
        catMap[c.id] = val && val > 0 ? val.toString() : '';
      });
      setCategoryBudgets(catMap);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, existingBudget, effectiveMonthKey, propSavingsTarget]);

  const numBudget = parseFloat(budgetAmount) || 0;
  const computedSavings = Math.round((numBudget * savingsPercentage) / 100);
  const weeklyInstalment = enableSavingsPlan && computedSavings > 0 ? Math.round(computedSavings / 4) : 0;
  const totalCategoryBudgets = Object.values<string>(categoryBudgets).reduce<number>(
    (sum, v) => sum + (parseFloat(v) || 0),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numBudget || numBudget <= 0) {
      setError('Veuillez saisir un montant de budget valide.');
      return;
    }

    const parsedCategoryBudgets: Record<string, number> = {};
    Object.entries(categoryBudgets).forEach(([catId, val]) => {
      const n = parseFloat(val as string) || 0;
      if (n > 0) parsedCategoryBudgets[catId] = Math.round(n);
    });

    if (onSave) {
      onSave({
        month: effectiveMonthKey,
        totalBudget: Math.round(numBudget),
        savingsTarget: enableSavingsPlan && computedSavings > 0 ? Math.round(computedSavings) : undefined,
        categoryBudgets: parsedCategoryBudgets,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="wf-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="wf-modal-card animate-sheetIn sm:animate-modalIn">
        {/* Mobile drag handle */}
        <div className="mobile-bottom-sheet-handle sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: 'var(--wf-border)' }}>
          <div>
            <h2 className="wf-title-section text-base sm:text-lg">
              Plafond budgétaire mensuel
            </h2>
            <p className="text-xs" style={{ color: 'var(--wf-text-tertiary)' }}>
              Mois de {formatMonthLabel(effectiveMonthKey)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl transition-colors touch-target"
            style={{ color: 'var(--wf-text-tertiary)' }}
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="wf-label text-xs">
              Plafond de Dépenses (FCFA)
            </label>
            <div className="relative flex items-center">
              <input
                id="budget-amount-input"
                type="number"
                inputMode="numeric"
                step="1000"
                min="1"
                value={budgetAmount}
                onChange={(e) => {
                  setBudgetAmount(e.target.value);
                  setError('');
                }}
                placeholder="Ex: 200000"
                autoFocus
                required
                className="wf-input font-bold text-lg tabular-nums pr-14"
              />
              <span
                className="absolute right-4 text-xs font-bold"
                style={{ color: 'var(--wf-primary)' }}
              >
                FCFA
              </span>
            </div>
          </div>

          {/* Savings Suggestion Box */}
          <div
            className="p-3.5 rounded-xl space-y-2.5"
            style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PiggyBank size={16} style={{ color: 'var(--wf-success)' }} />
                <span className="font-bold text-xs" style={{ color: 'var(--wf-text)' }}>
                  Plan d'épargne associé
                </span>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer touch-target">
                <input
                  id="toggle-savings-plan"
                  type="checkbox"
                  checked={enableSavingsPlan}
                  onChange={(e) => setEnableSavingsPlan(e.target.checked)}
                  className="w-4 h-4 rounded accent-[var(--wf-primary)] cursor-pointer"
                />
                <span className="text-xs font-semibold" style={{ color: 'var(--wf-text-secondary)' }}>Activer</span>
              </label>
            </div>

            {enableSavingsPlan && (
              <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--wf-border)' }}>
                <div className="flex items-center gap-1.5">
                  {[10, 15, 20, 25].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setSavingsPercentage(pct)}
                      className="flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all touch-target"
                      style={{
                        background: savingsPercentage === pct ? 'var(--wf-primary)' : 'var(--wf-surface)',
                        color: savingsPercentage === pct ? 'white' : 'var(--wf-text-secondary)',
                        borderColor: savingsPercentage === pct ? 'var(--wf-primary)' : 'var(--wf-border)',
                      }}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                {computedSavings > 0 && (
                  <div className="text-xs space-y-1 pt-1" style={{ color: 'var(--wf-text-secondary)' }}>
                    <div className="flex justify-between items-center">
                      <span>Objectif d'épargne :</span>
                      <strong className="font-bold tabular-nums" style={{ color: 'var(--wf-text)' }}>
                        {formatFCFA(computedSavings)}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-[11px]" style={{ color: 'var(--wf-text-tertiary)' }}>
                      <span>4 versements de :</span>
                      <span className="font-bold tabular-nums" style={{ color: 'var(--wf-text)' }}>
                        {formatFCFA(weeklyInstalment)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Per-category budgets (optional) */}
          {expenseCategories.length > 0 && (
            <div
              className="p-3.5 rounded-xl space-y-2.5"
              style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}
            >
              <div className="flex items-center gap-2">
                <Tag size={15} style={{ color: 'var(--wf-primary)' }} />
                <span className="font-bold text-xs" style={{ color: 'var(--wf-text)' }}>
                  Budgets par catégorie (optionnel)
                </span>
              </div>

              <div className="space-y-2 pt-1 max-h-52 overflow-y-auto pr-1">
                {expenseCategories.map((c) => {
                  const val = categoryBudgets[c.id] || '';
                  return (
                    <div key={c.id} className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--wf-surface)', color: c.color }}
                      >
                        <CategoryIcon category={c} className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold flex-1 truncate" style={{ color: 'var(--wf-text)' }}>
                        {c.name}
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1000"
                        value={val}
                        onChange={(e) => {
                          const next = { ...categoryBudgets };
                          next[c.id] = e.target.value;
                          setCategoryBudgets(next);
                        }}
                        placeholder="0"
                        className="w-24 px-2 py-1.5 text-right text-xs font-bold font-mono rounded-lg border"
                        style={{
                          background: 'var(--wf-surface)',
                          borderColor: 'var(--wf-border)',
                          color: 'var(--wf-text)',
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {totalCategoryBudgets > 0 && (
                <div
                  className="text-[11px] flex items-center justify-between pt-2 border-t"
                  style={{ borderColor: 'var(--wf-border)', color: 'var(--wf-text-tertiary)' }}
                >
                  <span>Total alloué par catégorie :</span>
                  <strong className="font-bold tabular-nums" style={{ color: 'var(--wf-text)' }}>
                    {formatFCFA(Math.round(totalCategoryBudgets))}
                  </strong>
                </div>
              )}
            </div>
          )}

          {error && (
            <div
              className="p-3 rounded-xl text-xs font-semibold border"
              style={{
                background: 'var(--wf-danger-soft)',
                color: 'var(--wf-danger)',
                borderColor: 'rgba(211,47,47,0.2)',
              }}
            >
              {error}
            </div>
          )}

          <div className="flex gap-2.5 pt-3 border-t" style={{ borderColor: 'var(--wf-border)' }}>
            <button
              id="budget-modal-cancel"
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-bold btn-ghost touch-target"
            >
              Annuler
            </button>
            <button
              id="budget-modal-submit"
              type="submit"
              className="flex-1 py-3 text-xs font-bold btn-primary touch-target"
            >
              Valider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
