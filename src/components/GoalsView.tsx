import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  X,
  PiggyBank,
  LayoutGrid,
  List,
  Target,
  Lightbulb,
  AlertTriangle,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { AppState, MonthSummary, SavingsGoal, SavingsMilestone } from '../types';
import { formatFCFA, formatMonthLabel } from '../utils/formatters';

interface GoalsViewProps {
  state: AppState;
  currentMonthKey: string;
  summary?: MonthSummary;
  onToggleMilestone?: (goalId: string, milestoneId: string) => void;
  onSaveGoal?: (newGoal: SavingsGoal) => void;
  onDeleteGoal?: (goalId: string) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  state,
  currentMonthKey,
  summary,
  onToggleMilestone,
  onSaveGoal,
  onDeleteGoal,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [goalTitleInput, setGoalTitleInput] = useState('');
  const [goalTargetInput, setGoalTargetInput] = useState('50000');
  const [boxCountChoice, setBoxCountChoice] = useState<number>(5);

  const goals = state.savingsGoals.length > 0 ? state.savingsGoals : [];

  const defaultGoal: SavingsGoal = {
    id: `goal-${currentMonthKey}`,
    month: currentMonthKey,
    title: "Tirelire d'Épargne",
    targetAmount: 50000,
    currentAmount: 0,
    createdAt: Date.now(),
    milestones: [
      { id: 'box-1', title: 'Case 1', targetAmount: 10000, isCompleted: false, completedAt: null },
      { id: 'box-2', title: 'Case 2', targetAmount: 10000, isCompleted: false, completedAt: null },
      { id: 'box-3', title: 'Case 3', targetAmount: 10000, isCompleted: false, completedAt: null },
      { id: 'box-4', title: 'Case 4', targetAmount: 10000, isCompleted: false, completedAt: null },
      { id: 'box-5', title: 'Case 5', targetAmount: 10000, isCompleted: false, completedAt: null },
    ],
  };

  const currentGoal = goals.find((g) => g.id === selectedGoalId) || goals[0] || defaultGoal;

  const totalBoxes = currentGoal.milestones ? currentGoal.milestones.length : 0;
  const completedBoxes = currentGoal.milestones
    ? currentGoal.milestones.filter((m) => m.isCompleted).length
    : 0;
  const progressPercent =
    currentGoal.targetAmount > 0
      ? Math.min(100, Math.round((currentGoal.currentAmount / currentGoal.targetAmount) * 100))
      : 0;

  const handleToggle = (goalId: string, milestoneId: string) => {
    if (onToggleMilestone) {
      onToggleMilestone(goalId, milestoneId);
    }
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(goalTargetInput) || 50000;
    const boxCount = boxCountChoice;
    const amountPerBox = Math.round(target / boxCount);

    const milestones: SavingsMilestone[] = Array.from({ length: boxCount }).map((_, i) => ({
      id: `box-${Date.now()}-${i}`,
      title: `Case ${i + 1}`,
      targetAmount: amountPerBox,
      isCompleted: false,
      completedAt: null,
    }));

    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      month: currentMonthKey,
      title: goalTitleInput.trim() || "Tirelire d'Épargne",
      targetAmount: target,
      currentAmount: 0,
      createdAt: Date.now(),
      milestones,
    };

    if (onSaveGoal) {
      onSaveGoal(newGoal);
    }
    setSelectedGoalId(newGoal.id);
    setIsNewGoalModalOpen(false);
    setGoalTitleInput('');
    setGoalTargetInput('50000');
  };

  // Suggestions
  const suggestions = [
    {
      id: 'sug-1',
      title: 'Discipline 52 semaines',
      description: 'Cochez une case de 10 000 FCFA chaque semaine pour sécuriser 520 000 FCFA par an.',
      priority: 'high',
      icon: <Target size={16} />,
      type: 'primary',
      action: 'Activer le rappel',
    },
    {
      id: 'sug-2',
      title: 'Fonds d’urgence recommandé',
      description: 'Constituez 3 mois de dépenses courantes pour parer à tout imprévu financier.',
      priority: 'medium',
      icon: <Shield size={16} />,
      type: 'warning',
      action: 'Créer un objectif',
    },
  ];

  return (
    <div className="wf-page animate-slideUp">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 md:mb-6 flex-wrap gap-3">
        <div>
          <h1 className="wf-title-page">Tirelire & Épargne</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--wf-text-secondary)' }}>
            Objectifs financiers et cases à valider
          </p>
        </div>

        <button
          onClick={() => setIsNewGoalModalOpen(true)}
          className="btn-primary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 touch-target"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Nouvel objectif</span>
        </button>
      </div>

      {/* Responsive 2-column layout on tablet & desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-start">
        {/* Colonne gauche : Tirelire Active & Cases */}
        <div className="space-y-4">
          {/* Goal Selector pills */}
          {goals.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {goals.map((g) => {
                const isSelected = g.id === currentGoal.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGoalId(g.id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all touch-target"
                    style={{
                      background: isSelected ? 'var(--wf-primary)' : 'var(--wf-surface-soft)',
                      color: isSelected ? 'white' : 'var(--wf-text-secondary)',
                      border: isSelected ? 'none' : '1px solid var(--wf-border)',
                    }}
                  >
                    {g.title}
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Goal Card */}
          <div className="liquid-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--wf-primary-soft)', color: 'var(--wf-primary)' }}
                >
                  <PiggyBank size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold truncate" style={{ color: 'var(--wf-text)' }}>
                    {currentGoal.title}
                  </h2>
                  <span className="text-xs" style={{ color: 'var(--wf-text-tertiary)' }}>
                    {completedBoxes} sur {totalBoxes} cases validées
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {goals.length > 1 && onDeleteGoal && (
                  <button
                    onClick={() => onDeleteGoal(currentGoal.id)}
                    className="p-2 rounded-lg transition-colors touch-target"
                    style={{ color: 'var(--wf-text-tertiary)' }}
                    title="Supprimer"
                  >
                    <Trash2 size={15} />
                  </button>
                )}

                <div
                  className="flex items-center p-0.5 rounded-lg"
                  style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}
                >
                  <button
                    onClick={() => setViewMode('grid')}
                    className="p-1 rounded-md transition-colors"
                    style={{
                      background: viewMode === 'grid' ? 'var(--wf-primary)' : 'transparent',
                      color: viewMode === 'grid' ? 'white' : 'var(--wf-text-tertiary)',
                    }}
                  >
                    <LayoutGrid size={13} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className="p-1 rounded-md transition-colors"
                    style={{
                      background: viewMode === 'list' ? 'var(--wf-primary)' : 'transparent',
                      color: viewMode === 'list' ? 'white' : 'var(--wf-text-tertiary)',
                    }}
                  >
                    <List size={13} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-baseline justify-between">
                <span className="wf-amount-medium" style={{ color: 'var(--wf-text)' }}>
                  {formatFCFA(currentGoal.currentAmount)}
                </span>
                <span
                  className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                  style={{ color: 'var(--wf-success)', background: 'var(--wf-success-soft)' }}
                >
                  {progressPercent}%
                </span>
              </div>

              <div className="liquid-progress">
                <div
                  className="liquid-progress-fill"
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                />
              </div>
            </div>

            {/* Cases / Milestones */}
            {currentGoal.milestones && currentGoal.milestones.length > 0 && (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  {currentGoal.milestones.map((m, idx) => (
                    <button
                      key={m.id || idx}
                      type="button"
                      onClick={() => handleToggle(currentGoal.id, m.id)}
                      className="p-3 rounded-xl border text-left transition-all flex items-center justify-between active:scale-95 touch-target"
                      style={{
                        background: m.isCompleted ? 'var(--wf-primary)' : 'var(--wf-surface-soft)',
                        borderColor: m.isCompleted ? 'var(--wf-primary)' : 'var(--wf-border)',
                        color: m.isCompleted ? 'white' : 'var(--wf-text)',
                      }}
                    >
                      <div>
                        <span
                          className="text-[10px] block opacity-75 uppercase font-semibold"
                          style={{ color: m.isCompleted ? 'white' : 'var(--wf-text-tertiary)' }}
                        >
                          Case {idx + 1}
                        </span>
                        <span
                          className="text-xs font-bold block tabular-nums"
                          style={{ color: m.isCompleted ? 'white' : 'var(--wf-text)' }}
                        >
                          {formatFCFA(m.targetAmount)}
                        </span>
                      </div>
                      <div>
                        {m.isCompleted ? (
                          <CheckCircle2 size={16} className="text-white" strokeWidth={2.5} />
                        ) : (
                          <Circle size={16} style={{ color: 'var(--wf-text-tertiary)' }} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-1 pt-2 border-t" style={{ borderColor: 'var(--wf-border)' }}>
                  {currentGoal.milestones.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      onClick={() => handleToggle(currentGoal.id, m.id)}
                      className="py-2.5 px-3 flex items-center justify-between rounded-xl transition-colors cursor-pointer hover:bg-[var(--wf-surface-soft)]"
                    >
                      <div className="flex items-center gap-2.5">
                        {m.isCompleted ? (
                          <CheckCircle2 size={16} style={{ color: 'var(--wf-success)' }} />
                        ) : (
                          <Circle size={16} style={{ color: 'var(--wf-text-tertiary)' }} />
                        )}
                        <span
                          className="text-xs font-semibold"
                          style={{
                            color: m.isCompleted ? 'var(--wf-text-tertiary)' : 'var(--wf-text)',
                            textDecoration: m.isCompleted ? 'line-through' : 'none',
                          }}
                        >
                          Case {idx + 1}
                        </span>
                      </div>
                      <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--wf-text)' }}>
                        {formatFCFA(m.targetAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Colonne droite : Conseils & Suggestions */}
        <div className="space-y-3">
          <h2 className="wf-title-section text-sm sm:text-base">
            Conseils d'épargne
          </h2>

          <div className="space-y-3">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="liquid-card p-4 transition-all"
                style={{
                  borderLeft: `4px solid ${suggestion.priority === 'high' ? 'var(--wf-primary)' : 'var(--wf-border)'}`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        suggestion.type === 'warning'
                          ? 'var(--wf-warning-soft)'
                          : 'var(--wf-primary-soft)',
                      color:
                        suggestion.type === 'warning'
                          ? 'var(--wf-warning)'
                          : 'var(--wf-primary)',
                    }}
                  >
                    {suggestion.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold mb-1" style={{ color: 'var(--wf-text)' }}>
                      {suggestion.title}
                    </h3>
                    <p className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--wf-text-secondary)' }}>
                      {suggestion.description}
                    </p>
                    <button
                      onClick={() => {
                        if (suggestion.id === 'sug-1') {
                          const milestones: SavingsMilestone[] = Array.from({ length: 52 }).map(
                            (_, i) => ({
                              id: `box-${Date.now()}-${i}`,
                              title: `Semaine ${i + 1}`,
                              targetAmount: 10000,
                              isCompleted: false,
                              completedAt: null,
                            })
                          );
                          const newGoal: SavingsGoal = {
                            id: `goal-${Date.now()}`,
                            month: currentMonthKey,
                            title: 'Discipline 52 semaines',
                            targetAmount: 520000,
                            currentAmount: 0,
                            createdAt: Date.now(),
                            milestones,
                          };
                          if (onSaveGoal) onSaveGoal(newGoal);
                          setSelectedGoalId(newGoal.id);
                        } else {
                          setIsNewGoalModalOpen(true);
                        }
                      }}
                      className="text-xs font-semibold px-3 py-1 rounded-lg btn-primary touch-target"
                    >
                      {suggestion.action}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Goal Modal */}
      {isNewGoalModalOpen && (
        <div
          className="wf-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsNewGoalModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="wf-modal-card animate-sheetIn sm:animate-modalIn space-y-4">
            <div className="mobile-bottom-sheet-handle sm:hidden" />

            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--wf-border)' }}>
              <h2 className="wf-title-section text-base">
                Créer une tirelire
              </h2>
              <button
                onClick={() => setIsNewGoalModalOpen(false)}
                className="p-1.5 rounded-xl transition-colors touch-target"
                style={{ color: 'var(--wf-text-tertiary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="wf-label text-xs">Intitulé de l'objectif</label>
                <input
                  type="text"
                  value={goalTitleInput}
                  onChange={(e) => setGoalTitleInput(e.target.value)}
                  placeholder="Ex: Voyage, Projet, Équipement..."
                  className="wf-input text-xs"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="wf-label text-xs mb-0">Montant cible (FCFA)</label>
                  <span className="text-xs font-mono font-bold" style={{ color: 'var(--wf-primary)' }}>
                    {formatFCFA(parseFloat(goalTargetInput) || 0)}
                  </span>
                </div>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={goalTargetInput}
                  onChange={(e) => setGoalTargetInput(e.target.value)}
                  placeholder="50000"
                  className="wf-input text-xs font-bold font-mono"
                  required
                />
                {/* Quick amount presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[25000, 50000, 100000, 250000, 500000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setGoalTargetInput(val.toString())}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all touch-target"
                      style={{
                        background:
                          goalTargetInput === val.toString()
                            ? 'var(--wf-primary-soft)'
                            : 'var(--wf-surface-soft)',
                        color:
                          goalTargetInput === val.toString()
                            ? 'var(--wf-primary)'
                            : 'var(--wf-text-secondary)',
                        borderColor:
                          goalTargetInput === val.toString()
                            ? 'var(--wf-primary)'
                            : 'var(--wf-border)',
                      }}
                    >
                      {formatFCFA(val, { compact: true })}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="wf-label text-xs">Nombre de cases</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 20, 50].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setBoxCountChoice(count)}
                      className="py-2 rounded-xl text-xs font-bold transition-all touch-target"
                      style={{
                        background: boxCountChoice === count ? 'var(--wf-primary)' : 'var(--wf-surface-soft)',
                        color: boxCountChoice === count ? 'white' : 'var(--wf-text-secondary)',
                        border: boxCountChoice === count ? 'none' : '1px solid var(--wf-border)',
                      }}
                    >
                      {count} cases
                    </button>
                  ))}
                </div>
                {/* Calculated amount per box indicator */}
                <div
                  className="p-2.5 rounded-xl text-xs mt-2.5 flex items-center justify-between"
                  style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}
                >
                  <span style={{ color: 'var(--wf-text-tertiary)' }}>Valeur par case :</span>
                  <strong className="font-bold tabular-nums" style={{ color: 'var(--wf-text)' }}>
                    {formatFCFA(
                      Math.round((parseFloat(goalTargetInput) || 50000) / boxCountChoice)
                    )}
                  </strong>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2 border-t" style={{ borderColor: 'var(--wf-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsNewGoalModalOpen(false)}
                  className="flex-1 py-3 rounded-xl text-xs font-bold btn-ghost touch-target"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold text-xs btn-primary touch-target"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};