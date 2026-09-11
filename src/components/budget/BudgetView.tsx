import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Edit2,
  Plus,
  Sparkles,
  Zap,
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
    totalIncome,
    monthlyBudgetTotal,
    monthlyBudgetSpent,
    monthlyBudgetRemaining,
    formatCurrency,
    setIsNewCategoryModalOpen,
    autoDistributeBudgets,
    userProfile,
  } = useWealth();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingLimit, setEditingLimit] = useState<string>('');
  const [isAutoSheetOpen, setIsAutoSheetOpen] = useState(false);
  const [autoIncome, setAutoIncome] = useState<string>(String(totalIncome));
  const [autoConfirmed, setAutoConfirmed] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

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
      return { ...category, spent, limit, progress, remaining, isOverBudget };
    })
    .sort((a, b) => b.progress - a.progress); // priorité aux plus consommées

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

  const handleApplyAuto = () => {
    const base = Math.max(0, Number(autoIncome) || 0);
    if (base === 0) return;
    autoDistributeBudgets(base);
    setAutoConfirmed(true);
    setTimeout(() => { setAutoConfirmed(false); setIsAutoSheetOpen(false); }, 1400);
  };

  const autoPreview = (() => {
    const base = Math.max(0, Number(autoIncome) || 0);
    if (base === 0) return [];
    const expenseCats = categories.filter((c) => c.type === 'expense');
    const allocatable = Math.round(base * 0.7);
    const totalExisting = expenseCats.reduce((s, c) => s + (c.budgetLimit || 1), 0);
    return expenseCats.map((c) => ({
      ...c,
      newLimit: Math.round(allocatable * ((c.budgetLimit || 1) / totalExisting)),
    }));
  })();

  // Catégories prioritaires : dépassées ou > 80 % consommées
  const urgentCats = categoryExpenses.filter((c) => c.isOverBudget || c.progress >= 80);
  const normalCats = categoryExpenses.filter((c) => !c.isOverBudget && c.progress < 80);

  // ── BottomSheets partagés ─────────────────────────────────────
  const editSheet = (
    <BottomSheet
      isOpen={Boolean(editingCategory)}
      onClose={() => setEditingCategory(null)}
      title="Modifier le plafond"
      subtitle={editingCategory?.name}
    >
      {editingCategory && (
        <div className="space-y-4 py-1">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F7F7]">
            <span className="text-[11px] text-[#6F6F73]">Plafond actuel</span>
            <span className="text-xs font-black text-[#18181B] num-tabular">
              {formatCurrency(editingCategory.budgetLimit)}
            </span>
          </div>
          <div>
            <label className="text-xs font-bold text-[#18181B] block mb-1.5">
              Nouveau plafond ({userProfile.currency || 'FCFA'})
            </label>
            <input
              type="number"
              min={0}
              value={editingLimit}
              onChange={(e) => setEditingLimit(e.target.value)}
              className="w-full p-3 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-sm font-black text-[#18181B] focus:outline-none focus:border-[#FF5330] num-tabular"
              placeholder="Ex: 50 000"
            />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#6F6F73] mb-1.5">Raccourcis</p>
            <div className="flex flex-wrap gap-1.5">
              {[25000, 50000, 100000, 150000, 200000, 300000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setEditingLimit(String(preset))}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition-all ${
                    editingLimit === String(preset)
                      ? 'bg-[#FF5330] text-white border-[#FF5330]'
                      : 'bg-[#F7F7F7] text-[#6F6F73] border-[#E8E8E8]'
                  }`}
                >
                  {preset >= 1000 ? `${preset / 1000}k` : preset}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setEditingCategory(null)} className="flex-1 py-2.5 rounded-xl border border-[#E8E8E8] text-xs font-bold text-[#6F6F73]">Annuler</button>
            <button onClick={handleSaveBudgetLimit} className="flex-1 py-2.5 rounded-xl bg-[#FF5330] text-white text-xs font-bold">Enregistrer</button>
          </div>
        </div>
      )}
    </BottomSheet>
  );

  const autoSheet = (
    <BottomSheet
      isOpen={isAutoSheetOpen}
      onClose={() => setIsAutoSheetOpen(false)}
      title="Budget automatique"
      subtitle="Répartition basée sur vos revenus"
    >
      <div className="space-y-4 py-1">
        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FF5330]/5 border border-[#FF5330]/15">
          <Sparkles className="w-4 h-4 text-[#FF5330] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#6F6F73] leading-relaxed">
            WealthFlow répartit <strong className="text-[#18181B]">70% de vos revenus</strong> entre vos catégories de dépense, proportionnellement à leurs plafonds actuels.
          </p>
        </div>
        <div>
          <label className="text-xs font-bold text-[#18181B] block mb-1.5">Base de revenus mensuels</label>
          <input
            type="number"
            min={0}
            value={autoIncome}
            onChange={(e) => setAutoIncome(e.target.value)}
            className="w-full p-3 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-sm font-black text-[#18181B] focus:outline-none focus:border-[#FF5330] num-tabular"
            placeholder="Ex: 1 500 000"
          />
          {totalIncome > 0 && (
            <button onClick={() => setAutoIncome(String(totalIncome))} className="text-[10px] font-bold text-[#FF5330] mt-1">
              Utiliser mes revenus ({formatCurrency(totalIncome)})
            </button>
          )}
        </div>
        {autoPreview.length > 0 && Number(autoIncome) > 0 && (
          <div>
            <p className="text-[10px] font-bold text-[#6F6F73] uppercase tracking-wider mb-1.5">Aperçu</p>
            <div className="rounded-xl border border-[#E8E8E8] divide-y divide-[#F0F0F0] overflow-hidden">
              {autoPreview.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#F7F7F7] flex items-center justify-center">
                      <CategoryIcon name={c.icon || c.name} className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#18181B]">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#A1A1AA] line-through num-tabular">{formatCurrency(c.budgetLimit)}</span>
                    <span className="text-xs font-black text-[#FF5330] num-tabular">→ {formatCurrency(c.newLimit)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {autoConfirmed && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Budgets mis à jour !</span>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <button onClick={() => setIsAutoSheetOpen(false)} className="flex-1 py-2.5 rounded-xl border border-[#E8E8E8] text-xs font-bold text-[#6F6F73]">Annuler</button>
          <button
            onClick={handleApplyAuto}
            disabled={!autoIncome || Number(autoIncome) === 0}
            className="flex-1 py-2.5 rounded-xl bg-[#FF5330] disabled:opacity-40 text-white text-xs font-bold"
          >
            Appliquer
          </button>
        </div>
      </div>
    </BottomSheet>
  );

  // ── Ligne catégorie partagée ──────────────────────────────────
  const CatRow = ({ cat, highlighted = false }: { cat: typeof categoryExpenses[0]; highlighted?: boolean; key?: React.Key }) => (
    <div
      onClick={() => handleOpenEdit(cat)}
      className={`px-4 py-3 cursor-pointer active:bg-[#FAFAFA] transition-colors ${highlighted ? 'bg-[#FFFBF9]' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
            cat.isOverBudget ? 'bg-[#EF4444]/10 text-[#EF4444]'
            : cat.progress >= 80 ? 'bg-[#F97316]/10 text-[#F97316]'
            : 'bg-[#F7F7F7] text-[#52525B]'
          }`}>
            <CategoryIcon name={cat.icon || cat.name} className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#18181B] truncate leading-tight">{cat.name}</p>
            <p className={`text-[11px] ${cat.isOverBudget ? 'text-[#EF4444] font-bold' : 'text-[#A1A1AA]'}`}>
              {cat.isOverBudget ? 'Dépassement de budget' : `${formatCurrency(cat.remaining)} disponibles`}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0 flex items-center gap-1.5">
          <div>
            <p className={`text-sm font-black num-tabular ${cat.isOverBudget ? 'text-[#EF4444]' : 'text-[#18181B]'}`}>
              {cat.progress}%
            </p>
          </div>
          <Edit2 className="w-3.5 h-3.5 text-[#D4D4D8]" />
        </div>
      </div>
      <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            cat.isOverBudget ? 'bg-[#EF4444]' : cat.progress > 80 ? 'bg-[#F97316]' : 'bg-[#FF5330]'
          }`}
          style={{ width: `${cat.progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[11px] text-[#A1A1AA] num-tabular">{formatCurrency(cat.spent)}</span>
        <span className="text-[11px] text-[#A1A1AA] num-tabular">/ {formatCurrency(cat.limit)}</span>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // LAYOUT MOBILE (< lg)
  // ─────────────────────────────────────────────────────────────────────────────
  const mobileView = (
    <div className="flex flex-col pb-24">

      {/* Header */}
      <header className="px-4 pt-4 pb-3 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Budget</h1>
          <p className="text-xs text-[#A1A1AA] mt-0.5">Suivi de vos dépenses</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => { setAutoIncome(String(totalIncome)); setIsAutoSheetOpen(true); }}
            className="w-8 h-8 rounded-full bg-[#FF5330]/10 flex items-center justify-center cursor-pointer"
            title="Budget automatique"
          >
            <Zap className="w-4 h-4 text-[#FF5330]" />
          </button>
          <button
            onClick={() => setIsNewCategoryModalOpen(true)}
            className="w-8 h-8 rounded-full bg-[#FF5330] flex items-center justify-center cursor-pointer"
            title="Nouvelle catégorie"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* Récap global */}
      <section className="mx-4 mb-4">
        <p className="text-xs text-[#A1A1AA] mb-1">Budget septembre</p>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-black text-[#18181B] num-tabular">{formatCurrency(monthlyBudgetSpent)}</span>
          <span className="text-sm text-[#A1A1AA] num-tabular">/ {formatCurrency(monthlyBudgetTotal)}</span>
          <span className={`ml-auto text-sm font-black num-tabular ${overallProgress > 90 ? 'text-[#EF4444]' : 'text-[#FF5330]'}`}>
            {overallProgress}% utilisé
          </span>
        </div>
        <div className="w-full h-2.5 bg-[#F0F0F0] rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallProgress > 90 ? 'bg-[#EF4444]' : overallProgress > 75 ? 'bg-[#F97316]' : 'bg-[#FF5330]'
            }`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-xs font-bold text-[#10B981] num-tabular">
          {formatCurrency(monthlyBudgetRemaining)} disponibles
        </p>
      </section>

      {/* Catégories */}
      {categoryExpenses.length === 0 ? (
        <div className="mx-4 py-10 text-center">
          <p className="text-sm font-bold text-[#18181B] mb-1">Aucune catégorie de dépense</p>
          <button onClick={() => setIsNewCategoryModalOpen(true)} className="text-xs font-bold text-[#FF5330] underline mt-2">
            Créer une catégorie
          </button>
        </div>
      ) : (
        <section className="mx-4">

          {/* Catégories prioritaires (urgentes) */}
          {urgentCats.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-2">Nécessitent une attention</p>
              <div className="bg-white rounded-2xl border border-[#E8E8E8] divide-y divide-[#F5F5F5] overflow-hidden">
                {urgentCats.map((cat) => <CatRow key={cat.id} cat={cat} highlighted />)}
              </div>
            </div>
          )}

          {/* Autres catégories */}
          {normalCats.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-2">Catégories</p>
              <div className="bg-white rounded-2xl border border-[#E8E8E8] divide-y divide-[#F5F5F5] overflow-hidden">
                {(showAllCategories ? normalCats : normalCats.slice(0, 4)).map((cat) => (
                  <CatRow key={cat.id} cat={cat} />
                ))}
              </div>
              {normalCats.length > 4 && (
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="w-full text-center text-xs font-bold text-[#FF5330] py-3 flex items-center justify-center gap-1 cursor-pointer"
                >
                  {showAllCategories ? 'Voir moins' : `Voir toutes les catégories (${normalCats.length})`}
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAllCategories ? 'rotate-90' : ''}`} />
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {editSheet}
      {autoSheet}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // LAYOUT DESKTOP (>= lg) — conservé
  // ─────────────────────────────────────────────────────────────────────────────
  const desktopView = (
    <div id="budget-view" className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">Gestion des Budgets</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F7F7F7] text-[#6F6F73] border border-[#E8E8E8]">
              Septembre 2026
            </span>
          </div>
          <p className="text-xs text-[#6F6F73] mt-0.5">Plafonnez vos dépenses par catégorie</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => { setAutoIncome(String(totalIncome)); setIsAutoSheetOpen(true); }}
            className="inline-flex items-center space-x-1.5 py-2 px-3 rounded-xl bg-[#FF5330]/10 active:scale-95 text-[#FF5330] font-bold text-xs transition-all cursor-pointer border border-[#FF5330]/20"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Budget auto</span>
          </button>
          <button
            onClick={() => setIsNewCategoryModalOpen(true)}
            className="inline-flex items-center space-x-1.5 py-2 px-3 rounded-xl bg-[#FF5330] active:scale-95 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Catégorie</span>
          </button>
        </div>
      </div>

      {/* KPI global */}
      <div className="p-3.5 rounded-2xl bg-[#18181B] text-white shadow-sm space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/60">RÉCAPITULATIF MENSUEL</span>
          <span className="text-xs font-black text-[#FF5330] bg-[#FF5330]/20 px-2 py-0.5 rounded-full">{overallProgress}% consommé</span>
        </div>
        <div>
          <p className="text-xs text-white/70">Budget total alloué</p>
          <p className="text-xl sm:text-2xl font-black num-tabular text-white">{formatCurrency(monthlyBudgetTotal)}</p>
        </div>
        <div className="space-y-1.5">
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${overallProgress > 90 ? 'bg-[#EF4444]' : 'bg-[#FF5330]'}`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-white/90 num-tabular">
            <span>Dépensé : {formatCurrency(monthlyBudgetSpent)}</span>
            <span className="text-[#10B981]">Reste : {formatCurrency(monthlyBudgetRemaining)}</span>
          </div>
        </div>
        {totalIncome > 0 && (
          <div className="pt-1 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] text-white/50">Revenus enregistrés</span>
            <span className="text-[11px] font-black text-[#10B981] num-tabular">{formatCurrency(totalIncome)}</span>
          </div>
        )}
      </div>

      {/* Liste catégories desktop */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-sm text-[#18181B]">Répartition par catégorie</h3>
          <span className="text-xs text-[#6F6F73]">{categoryExpenses.length} catégories actives</span>
        </div>
        <div className="rounded-2xl bg-white border border-[#E8E8E8] shadow-2xs divide-y divide-[#F0F0F0] overflow-hidden">
          {categoryExpenses.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleOpenEdit(cat)}
              className="p-3 active:bg-[#F4F4F5] transition-colors cursor-pointer space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#F7F7F7] flex items-center justify-center text-[#18181B] flex-shrink-0">
                    <CategoryIcon name={cat.icon || cat.name} className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-[#18181B] truncate">{cat.name}</p>
                    <p className="text-[10px] text-[#6F6F73]">
                      {cat.isOverBudget
                        ? <span className="text-[#EF4444] font-bold">Dépassement de budget</span>
                        : `${formatCurrency(cat.remaining)} disponibles`
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 flex items-center gap-2">
                  <div>
                    <p className="text-xs sm:text-sm font-black text-[#18181B] num-tabular">
                      {formatCurrency(cat.spent)}{' '}
                      <span className="text-[11px] font-normal text-[#6F6F73]">/ {formatCurrency(cat.limit)}</span>
                    </p>
                    <span className={`text-[10px] font-extrabold block text-right ${cat.isOverBudget ? 'text-[#EF4444]' : 'text-[#FF5330]'}`}>
                      {cat.progress}%
                    </span>
                  </div>
                  <Edit2 className="w-3.5 h-3.5 text-[#A1A1AA] flex-shrink-0" />
                </div>
              </div>
              <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${cat.isOverBudget ? 'bg-[#EF4444]' : cat.progress > 80 ? 'bg-[#F97316]' : 'bg-[#FF5330]'}`}
                  style={{ width: `${cat.progress}%` }}
                />
              </div>
            </div>
          ))}
          {categoryExpenses.length === 0 && (
            <div className="p-8 text-center space-y-2">
              <p className="text-sm font-bold text-[#18181B]">Aucune catégorie de dépense</p>
              <button onClick={() => setIsNewCategoryModalOpen(true)} className="mt-1 text-xs font-bold text-[#FF5330]">
                Créer une catégorie
              </button>
            </div>
          )}
        </div>
      </div>

      {editSheet}
      {autoSheet}
    </div>
  );

  return (
    <>
      <div className="lg:hidden animate-in fade-in duration-200">{mobileView}</div>
      <div className="hidden lg:block animate-in fade-in duration-200">{desktopView}</div>
    </>
  );
};
