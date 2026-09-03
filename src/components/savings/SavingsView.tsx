import React, { useState } from 'react';
import {
  ArrowRight,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
  Layers,
  PiggyBank,
  Plane,
  Plus,
  Shield,
  Sparkles,
  Target,
  Trash2,
  Zap,
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

  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalRemaining = Math.max(0, totalTarget - totalSaved);
  const activeGoalsCount = savingsGoals.length;

  const handleDepositSubmit = () => {
    if (depositGoal && Number(customAmount) > 0) {
      contributeToGoal(depositGoal.id, Number(customAmount));
      setDepositGoal(null);
      setCustomAmount('');
    }
  };

  const getGoalIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'car':
        return <Car className="w-5 h-5 text-[#FF5330]" />;
      case 'plane':
        return <Plane className="w-5 h-5 text-[#F97316]" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-[#18181B]" />;
      case 'graduationcap':
        return <GraduationCap className="w-5 h-5 text-[#10B981]" />;
      default:
        return <PiggyBank className="w-5 h-5 text-[#FF5330]" />;
    }
  };

  return (
    <div id="savings-view" className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      
      {/* 1. Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
              Tirelires & Épargne
            </h2>
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
          className="inline-flex items-center justify-center space-x-2 py-2 px-3.5 rounded-xl bg-[#FF5330] hover:bg-[#E84524] active:scale-95 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nouvel objectif</span>
        </button>
      </div>

      {/* 2. Key Metrics Strip (Strong Hierarchy) */}
      <div className="p-3.5 rounded-2xl bg-[#18181B] text-white shadow-sm space-y-2.5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/60">
            ÉPARGNE GLOBALE CUMULÉE
          </span>
          <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/20 px-2 py-0.5 rounded-full">
            +38% vs obj.
          </span>
        </div>

        <div>
          <p className="text-xs text-white/70">Total épargné</p>
          <h2 className="text-2xl sm:text-3xl font-black num-tabular text-white">
            {formatCurrency(totalSaved)}
          </h2>
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

      {/* 3. Savings Goals List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-sm text-[#18181B]">Vos Tirelires Actives</h3>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E8E8E8] space-y-2">
            <PiggyBank className="w-8 h-8 text-[#A1A1AA] mx-auto" />
            <p className="font-bold text-sm text-[#18181B]">Aucun objectif d'épargne en cours.</p>
            <p className="text-xs text-[#6F6F73]">
              Créez votre première tirelire pour planifier vos projets.
            </p>
            <button
              onClick={() => setIsNewGoalModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-[#FF5330] text-white font-bold text-xs"
            >
              Créer un objectif
            </button>
          </div>
        ) : (
          savingsGoals.map((goal) => {
            const progress = Math.min(
              100,
              Math.round((goal.currentAmount / goal.targetAmount) * 100)
            );
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const boxesCount = goal.checkboxesCount || 10;
            const stepValue = Math.round(goal.targetAmount / boxesCount);

            return (
              <div
                key={goal.id}
                className="p-3 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-2"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#F7F7F7] flex items-center justify-center flex-shrink-0">
                      {getGoalIcon(goal.icon)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-[#18181B] truncate">{goal.title}</h4>
                      <p className="text-[10px] text-[#6F6F73] truncate">
                        Échéance : {goal.deadline}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-black text-[#FF5330] num-tabular">{progress}%</span>
                    <span className="text-[10px] text-[#6F6F73] block">
                      Reste {formatCurrency(remaining)}
                    </span>
                  </div>
                </div>

                {/* Amount Progress Bar */}
                <div className="space-y-0.5">
                  <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF5330] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-[#18181B] num-tabular">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span className="text-[#6F6F73]">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>

                {/* Tirelire Checkboxes */}
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
                          className={`h-7 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer active:scale-90 ${
                            isChecked
                              ? 'bg-[#FF5330] border-[#FF5330] text-white shadow-xs'
                              : 'bg-[#F7F7F7] border-[#E8E8E8] text-[#A1A1AA] hover:border-[#FF5330]/40'
                          }`}
                          title={`Valider case ${idx + 1}`}
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

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between border-t border-[#F0F0F0]">
                  <button
                    onClick={() => setDepositGoal(goal)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FF5330]/10 hover:bg-[#FF5330]/20 text-[#FF5330] font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Verser un montant</span>
                  </button>

                  <button
                    onClick={() => deleteSavingsGoal(goal.id)}
                    className="p-1.5 text-[#A1A1AA] hover:text-[#EF4444] transition-colors cursor-pointer"
                    title="Supprimer la tirelire"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Deposit Bottom Sheet */}
      <BottomSheet
        isOpen={Boolean(depositGoal)}
        onClose={() => setDepositGoal(null)}
        title="Alimenter la tirelire"
        subtitle={depositGoal?.title}
      >
        {depositGoal && (
          <div className="space-y-4 py-1">
            {/* Quick Amounts */}
            <div>
              <p className="text-xs font-bold text-[#18181B] mb-2">Montants rapides</p>
              <div className="grid grid-cols-3 gap-2">
                {[10000, 25000, 50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustomAmount(String(amt))}
                    className="py-2.5 rounded-xl border border-[#E8E8E8] bg-[#F7F7F7] hover:border-[#FF5330] active:scale-95 text-xs font-bold text-[#18181B] transition-all"
                  >
                    +{formatCurrency(amt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1.5">
                Montant personnalisé (FCFA)
              </label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Ex: 15000"
                className="w-full p-3 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-sm font-black text-[#18181B] focus:outline-none focus:border-[#FF5330]"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setDepositGoal(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E8E8E8] text-xs font-bold text-[#6F6F73]"
              >
                Annuler
              </button>
              <button
                onClick={handleDepositSubmit}
                className="flex-1 py-2.5 rounded-xl bg-[#FF5330] text-white text-xs font-bold shadow-xs"
              >
                Confirmer le versement
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

    </div>
  );
};
