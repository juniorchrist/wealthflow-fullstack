import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Edit2,
  PieChart,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { Category } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { BottomSheet } from '../common/BottomSheet';

export const BudgetView: React.FC = () => {
  const {
    categories,
    updateCategory,
    transactions,
    monthlyBudgetTotal,
    monthlyBudgetSpent,
    monthlyBudgetRemaining,
    formatCurrency,
    setIsNewCategoryModalOpen,
  } = useWealth();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingLimit, setEditingLimit] = useState<string>('');

  // Calculate actual spent per category for current month
  const categoryExpenses = categories
    .filter((c) => c.type === 'expense')
    .map((category) => {
      const spent = transactions
        .filter(
          (t) =>
            (t.categoryId === category.id || t.category === category.name) &&
            t.type !== 'income'
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const limit = category.budgetLimit || 1;
      const progress = Math.min(100, Math.round((spent / limit) * 100));
      const remaining = Math.max(0, limit - spent);
      const isOverBudget = spent > limit;

      return {
        ...category,
        spent,
        limit,
        progress,
        remaining,
        isOverBudget,
      };
    });

  const overallProgress = Math.min(
    100,
    monthlyBudgetTotal > 0
      ? Math.round((monthlyBudgetSpent / monthlyBudgetTotal) * 100)
      : 0
  );

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setEditingLimit(String(cat.budgetLimit));
  };

  const handleSaveBudgetLimit = () => {
    if (editingCategory) {
      updateCategory(editingCategory.id, { budgetLimit: Math.max(0, Number(editingLimit) || 0) });
      setEditingCategory(null);
    }
  };

  return (
    <div id="budget-view" className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
              Gestion des Budgets
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F7F7F7] text-[#6F6F73] border border-[#E8E8E8]">
              Septembre 2026
            </span>
          </div>
          <p className="text-xs text-[#6F6F73] mt-0.5">
            Plafonnez vos dépenses par catégorie et contrôlez vos sorties
          </p>
        </div>

        <button
          onClick={() => setIsNewCategoryModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 py-2 px-3.5 rounded-xl bg-[#FF5330] hover:bg-[#E84524] active:scale-95 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nouvelle catégorie</span>
        </button>
      </div>

      {/* 2. Primary KPI Summary Banner */}
      <div className="p-3.5 rounded-2xl bg-[#18181B] text-white shadow-sm space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/60">
            RÉCAPITULATIF MENSUEL
          </span>
          <span className="text-xs font-black text-[#FF5330] bg-[#FF5330]/20 px-2 py-0.5 rounded-full">
            {overallProgress}% consommé
          </span>
        </div>

        <div>
          <p className="text-xs text-white/70">Budget total alloué</p>
          <p className="text-xl sm:text-2xl font-black num-tabular text-white">
            {formatCurrency(monthlyBudgetTotal)}
          </p>
        </div>

        {/* Big Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                overallProgress > 90 ? 'bg-[#EF4444]' : 'bg-[#FF5330]'
              }`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold text-white/90 num-tabular">
            <span>Dépensé : {formatCurrency(monthlyBudgetSpent)}</span>
            <span className="text-[#10B981]">Reste : {formatCurrency(monthlyBudgetRemaining)}</span>
          </div>
        </div>
      </div>

      {/* 3. Categories Budget Breakdown (Single Column Compact List) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-sm text-[#18181B]">Répartition par catégorie</h3>
          <span className="text-xs text-[#6F6F73]">{categoryExpenses.length} catégories actives</span>
        </div>

        <div className="rounded-2xl bg-white border border-[#E8E8E8] shadow-2xs divide-y divide-[#F0F0F0] overflow-hidden">
          {categoryExpenses.map((cat) => {
            return (
              <div
                key={cat.id}
                onClick={() => handleOpenEdit(cat)}
                className="p-3 hover:bg-[#FAFAFA] active:bg-[#F4F4F5] transition-colors cursor-pointer space-y-1.5"
              >
                {/* Top Row: Icon + Title + Spent / Limit */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#F7F7F7] flex items-center justify-center text-[#18181B] flex-shrink-0">
                      <CategoryIcon name={cat.name} className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-[#18181B] truncate">{cat.name}</p>
                      <p className="text-[10px] text-[#6F6F73]">
                        {cat.isOverBudget ? (
                          <span className="text-[#EF4444] font-bold">Dépassement de budget</span>
                        ) : (
                          `${formatCurrency(cat.remaining)} disponibles`
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs sm:text-sm font-black text-[#18181B] num-tabular">
                      {formatCurrency(cat.spent)}{' '}
                      <span className="text-[11px] font-normal text-[#6F6F73]">
                        / {formatCurrency(cat.limit)}
                      </span>
                    </p>
                    <span
                      className={`text-[10px] font-extrabold ${
                        cat.isOverBudget ? 'text-[#EF4444]' : 'text-[#FF5330]'
                      }`}
                    >
                      {cat.progress}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      cat.isOverBudget
                        ? 'bg-[#EF4444]'
                        : cat.progress > 80
                        ? 'bg-[#F97316]'
                        : 'bg-[#FF5330]'
                    }`}
                    style={{ width: `${cat.progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Edit Budget Bottom Sheet */}
      <BottomSheet
        isOpen={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        title="Modifier le plafond"
        subtitle={editingCategory?.name}
      >
        {editingCategory && (
          <div className="space-y-4 py-1">
            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1.5">
                Nouveau plafond mensuel (FCFA)
              </label>
              <input
                type="number"
                value={editingLimit}
                onChange={(e) => setEditingLimit(e.target.value)}
                className="w-full p-3 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-sm font-black text-[#18181B] focus:outline-none focus:border-[#FF5330]"
                placeholder="Ex: 50000"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setEditingCategory(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E8E8E8] text-xs font-bold text-[#6F6F73]"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveBudgetLimit}
                className="flex-1 py-2.5 rounded-xl bg-[#FF5330] text-white text-xs font-bold shadow-xs"
              >
                Enregistrer
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

    </div>
  );
};
