import React, { useState } from 'react';
import {
  Car,
  Check,
  ChevronLeft,
  GraduationCap,
  MoreHorizontal,
  PiggyBank,
  Plane,
  Plus,
  Shield,
  Trash2,
  X,
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { SavingsGoal } from '../../types';
import { BottomSheet } from '../common/BottomSheet';

export const SavingsView: React.FC = () => {
  const {
    savingsGoals,
    totalSaved,
    formatCurrency,
    setIsNewGoalModalOpen,
    contributeToGoal,
    toggleGoalCheckbox,
    deleteSavingsGoal,
  } = useWealth();

  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [detailGoal, setDetailGoal] = useState<SavingsGoal | null>(null);

  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalRemaining = Math.max(0, totalTarget - totalSaved);
  const activeGoalsCount = savingsGoals.length;

  const handleDepositSubmit = () => {
    if (depositGoal && Number(customAmount) > 0) {
      contributeToGoal(depositGoal.id, Number(customAmount));
      setDepositGoal(null);
      setCustomAmount('');
      setDetailGoal(null); // ferme aussi le détail si ouvert
    }
  };

  const getGoalIcon = (iconName: string, size = 'w-5 h-5') => {
    switch (iconName?.toLowerCase()) {
      case 'car': return <Car className={`${size} text-[#FF5330]`} />;
      case 'plane': return <Plane className={`${size} text-[#F97316]`} />;
      case 'shield': return <Shield className={`${size} text-[#18181B]`} />;
      case 'graduationcap': return <GraduationCap className={`${size} text-[#10B981]`} />;
      default: return <PiggyBank className={`${size} text-[#FF5330]`} />;
    }
  };

  // ── Sheet versement partagé ───────────────────────────────────
  const depositSheet = (
    <BottomSheet
      isOpen={Boolean(depositGoal)}
      onClose={() => { setDepositGoal(null); setCustomAmount(''); }}
      title="Verser un montant"
      subtitle={depositGoal?.title}
    >
      {depositGoal && (
        <div className="space-y-4 py-1">
          <div className="grid grid-cols-3 gap-2">
            {[10000, 25000, 50000, 100000, 150000, 200000].map((amt) => (
              <button
                key={amt}
                onClick={() => setCustomAmount(String(amt))}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  customAmount === String(amt) ? 'bg-[#FF5330] text-white border-[#FF5330]' : 'bg-[#F7F7F7] border-[#E8E8E8] text-[#18181B]'
                }`}
              >
                +{amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs font-bold text-[#18181B] block mb-1.5">Montant personnalisé</label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Ex: 75 000"
              className="w-full p-3 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-sm font-black text-[#18181B] focus:outline-none focus:border-[#FF5330] num-tabular"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => { setDepositGoal(null); setCustomAmount(''); }} className="flex-1 py-2.5 rounded-xl border border-[#E8E8E8] text-xs font-bold text-[#6F6F73]">Annuler</button>
            <button
              onClick={handleDepositSubmit}
              disabled={!customAmount || Number(customAmount) <= 0}
              className="flex-1 py-2.5 rounded-xl bg-[#FF5330] disabled:opacity-40 text-white text-xs font-bold"
            >
              Confirmer le versement
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
  );

  // ── Sheet détail objectif (mobile) ────────────────────────────
  const detailSheet = (
    <BottomSheet
      isOpen={Boolean(detailGoal)}
      onClose={() => setDetailGoal(null)}
      maxHeight="max-h-[90vh]"
    >
      {detailGoal && (() => {
        const progress = Math.min(100, Math.round((detailGoal.currentAmount / detailGoal.targetAmount) * 100));
        const remaining = Math.max(0, detailGoal.targetAmount - detailGoal.currentAmount);
        const boxesCount = detailGoal.checkboxesCount || 10;
        const stepValue = Math.round(detailGoal.targetAmount / boxesCount);

        // Historique des versements (transactions savings_deposit liées)
        return (
          <div className="space-y-4 pb-2">
            {/* En-tête détail */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F7F7] flex items-center justify-center flex-shrink-0">
                {getGoalIcon(detailGoal.icon, 'w-6 h-6')}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-black text-[#18181B] leading-tight">{detailGoal.title}</h2>
                <p className="text-xs text-[#A1A1AA]">Échéance : {detailGoal.deadline}</p>
              </div>
            </div>

            {/* Progression principale */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-black text-[#18181B] num-tabular">{progress}%</span>
                <span className="text-sm text-[#A1A1AA]">de progression</span>
              </div>
              <div className="w-full h-3 bg-[#F0F0F0] rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-[#FF5330] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-black text-[#18181B] num-tabular">{formatCurrency(detailGoal.currentAmount)}</span>
                <span className="text-sm text-[#A1A1AA] num-tabular">/ {formatCurrency(detailGoal.targetAmount)}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#F7F7F7] text-center">
                <p className="text-base font-black text-[#FF5330] num-tabular">{formatCurrency(remaining)}</p>
                <p className="text-[10px] text-[#A1A1AA] mt-0.5">Reste à épargner</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F7F7] text-center">
                <p className="text-base font-black text-[#18181B]">{detailGoal.deadline}</p>
                <p className="text-[10px] text-[#A1A1AA] mt-0.5">Échéance</p>
              </div>
            </div>

            {/* Cases de progression */}
            <div>
              <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-2">
                Paliers ({formatCurrency(stepValue)} / case)
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: boxesCount }).map((_, idx) => {
                  const isChecked =
                    detailGoal.checkedBoxes?.includes(idx) ||
                    idx < Math.floor((detailGoal.currentAmount / detailGoal.targetAmount) * boxesCount);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleGoalCheckbox(detailGoal.id, idx)}
                      className={`h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                        isChecked ? 'bg-[#FF5330] border-[#FF5330] text-white' : 'bg-[#F7F7F7] border-[#E8E8E8] text-[#A1A1AA]'
                      }`}
                    >
                      {isChecked ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="text-[10px] font-black">{idx + 1}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA versement */}
            <button
              onClick={() => { setDetailGoal(null); setDepositGoal(detailGoal); }}
              className="w-full py-3.5 rounded-2xl bg-[#FF5330] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Verser un montant
            </button>

            {/* Supprimer */}
            <button
              onClick={() => { deleteSavingsGoal(detailGoal.id); setDetailGoal(null); }}
              className="w-full py-2.5 rounded-xl bg-[#FEE2E2] text-[#EF4444] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer cet objectif
            </button>
          </div>
        );
      })()}
    </BottomSheet>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // LAYOUT MOBILE (< lg)
  // ─────────────────────────────────────────────────────────────────────────────
  const mobileView = (
    <div className="flex flex-col pb-24">

      {/* Header */}
      <header className="px-4 pt-4 pb-3 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Épargne</h1>
          <p className="text-xs text-[#A1A1AA] mt-0.5">Atteignez vos objectifs</p>
        </div>
        <button
          id="btn-add-savings-goal"
          onClick={() => setIsNewGoalModalOpen(true)}
          className="mt-1 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FF5330] text-white font-bold text-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Ajouter
        </button>
      </header>

      {/* Total épargne */}
      <section className="mx-4 mb-5">
        <div className="p-4 rounded-2xl bg-[#18181B] text-white">
          <p className="text-xs text-white/60 mb-1">Épargne totale</p>
          <p className="text-3xl font-black num-tabular">{formatCurrency(totalSaved)}</p>
          {totalSaved > 0 && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10 text-xs">
              <div>
                <span className="text-white/50 block text-[10px]">Objectifs actifs</span>
                <span className="font-bold text-white">{activeGoalsCount} projets</span>
              </div>
              <div className="w-px h-5 bg-white/15" />
              <div>
                <span className="text-white/50 block text-[10px]">Reste à atteindre</span>
                <span className="font-bold text-[#FF5330] num-tabular">{formatCurrency(totalRemaining)}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Objectifs */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#18181B]">Mes objectifs</h3>
          {savingsGoals.length > 0 && (
            <span className="text-xs text-[#A1A1AA]">{savingsGoals.length} objectif{savingsGoals.length > 1 ? 's' : ''}</span>
          )}
        </div>

        {savingsGoals.length === 0 ? (
          <div className="py-12 text-center">
            <PiggyBank className="w-10 h-10 text-[#D4D4D8] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#18181B] mb-1">Aucun objectif en cours</p>
            <p className="text-xs text-[#A1A1AA] mb-4">Créez votre premier objectif d'épargne.</p>
            <button
              onClick={() => setIsNewGoalModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#FF5330] text-white font-bold text-sm cursor-pointer"
            >
              Créer un objectif
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {savingsGoals.map((goal) => {
              const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
              return (
                <button
                  key={goal.id}
                  onClick={() => setDetailGoal(goal)}
                  className="w-full text-left bg-white rounded-2xl border border-[#E8E8E8] p-4 active:bg-[#FAFAFA] transition-colors cursor-pointer"
                >
                  {/* Header objectif */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#F7F7F7] flex items-center justify-center flex-shrink-0">
                        {getGoalIcon(goal.icon)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#18181B] truncate">{goal.title}</p>
                        <p className="text-[11px] text-[#A1A1AA]">{goal.deadline}</p>
                      </div>
                    </div>
                    <span className="text-base font-black text-[#FF5330] num-tabular flex-shrink-0">{progress}%</span>
                  </div>

                  {/* Barre de progression */}
                  <div className="w-full h-2 bg-[#F0F0F0] rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-[#FF5330] rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>

                  {/* Montants */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#18181B] num-tabular">{formatCurrency(goal.currentAmount)}</span>
                    <span className="text-xs text-[#A1A1AA] num-tabular">/ {formatCurrency(goal.targetAmount)}</span>
                  </div>

                  {/* Reste */}
                  <p className="text-[11px] text-[#A1A1AA] mt-1 num-tabular">
                    {formatCurrency(remaining)} restants · {goal.deadline}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {detailSheet}
      {depositSheet}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // LAYOUT DESKTOP (>= lg) — conservé
  // ─────────────────────────────────────────────────────────────────────────────
  const desktopView = (
    <div id="savings-view" className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">Tirelires & Épargne</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF5330]/10 text-[#FF5330]">
              {activeGoalsCount} Objectifs
            </span>
          </div>
          <p className="text-xs text-[#6F6F73] mt-0.5">
            Suivez votre progression visuelle avec le système de cases à cocher
          </p>
        </div>
        <button
          id="btn-add-savings-goal"
          onClick={() => setIsNewGoalModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 py-2 px-3.5 rounded-xl bg-[#FF5330] active:scale-95 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nouvel objectif</span>
        </button>
      </div>

      {/* Métriques globales */}
      <div className="p-3.5 rounded-2xl bg-[#18181B] text-white shadow-sm space-y-2.5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/60">ÉPARGNE GLOBALE CUMULÉE</span>
          <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/20 px-2 py-0.5 rounded-full">+38% vs obj.</span>
        </div>
        <div>
          <p className="text-xs text-white/70">Total épargné</p>
          <h2 className="text-2xl sm:text-3xl font-black num-tabular text-white">{formatCurrency(totalSaved)}</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
          <div>
            <span className="text-white/60 block text-[10px]">Objectifs actifs</span>
            <span className="font-bold text-white num-tabular">{activeGoalsCount} projets</span>
          </div>
          <div>
            <span className="text-white/60 block text-[10px]">Montant restant</span>
            <span className="font-bold text-[#FF5330] num-tabular">{formatCurrency(totalRemaining)}</span>
          </div>
        </div>
      </div>

      {/* Liste goals desktop */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-sm text-[#18181B]">Vos Tirelires Actives</h3>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E8E8E8] space-y-2">
            <PiggyBank className="w-8 h-8 text-[#A1A1AA] mx-auto" />
            <p className="font-bold text-sm text-[#18181B]">Aucun objectif d'épargne en cours.</p>
            <button onClick={() => setIsNewGoalModalOpen(true)} className="mt-2 px-4 py-2 rounded-xl bg-[#FF5330] text-white font-bold text-xs">
              Créer un objectif
            </button>
          </div>
        ) : (
          savingsGoals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const boxesCount = goal.checkboxesCount || 10;
            const stepValue = Math.round(goal.targetAmount / boxesCount);

            return (
              <div key={goal.id} className="p-3 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#F7F7F7] flex items-center justify-center flex-shrink-0">
                      {getGoalIcon(goal.icon)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-[#18181B] truncate">{goal.title}</h4>
                      <p className="text-[10px] text-[#6F6F73] truncate">Échéance : {goal.deadline}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-black text-[#FF5330] num-tabular">{progress}%</span>
                    <span className="text-[10px] text-[#6F6F73] block">Reste {formatCurrency(remaining)}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF5330] rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-[#18181B] num-tabular">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span className="text-[#6F6F73]">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                      Cases de progression ({formatCurrency(stepValue)} / case)
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: boxesCount }).map((_, idx) => {
                      const isChecked =
                        goal.checkedBoxes?.includes(idx) ||
                        idx < Math.floor((goal.currentAmount / goal.targetAmount) * boxesCount);
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleGoalCheckbox(goal.id, idx)}
                          className={`h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                            isChecked ? 'bg-[#FF5330] border-[#FF5330] text-white shadow-xs' : 'bg-[#F7F7F7] border-[#E8E8E8] text-[#A1A1AA]'
                          }`}
                        >
                          {isChecked ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="text-[10px] font-black">{idx + 1}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#F0F0F0]">
                  <button
                    onClick={() => setDepositGoal(goal)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FF5330]/10 text-[#FF5330] font-bold text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Verser un montant</span>
                  </button>
                  <button onClick={() => deleteSavingsGoal(goal.id)} className="p-1.5 text-[#A1A1AA] cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {depositSheet}
    </div>
  );

  return (
    <>
      <div className="lg:hidden animate-in fade-in duration-200">{mobileView}</div>
      <div className="hidden lg:block animate-in fade-in duration-200">{desktopView}</div>
    </>
  );
};
