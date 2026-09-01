import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Building2,
  PiggyBank,
  PieChart as PieIcon,
  Calculator,
  ArrowRight,
  ChevronRight,
  Sliders,
  Percent,
} from 'lucide-react';
import { AppState, MonthSummary, SavingsGoal } from '../types';
import { formatFCFA, formatMonthLabel } from '../utils/formatters';
import {
  INVESTMENT_PRODUCTS,
  generateAllocationProfiles,
  calculateInvestmentProjection,
} from '../utils/investmentAdvisor';
import { generateStrategyRecommendations } from '../services/strategyService';
import { AlertTriangle, Lightbulb, Target, CheckCircle2, CornerDownRight } from 'lucide-react';

interface InvestmentAdvisorViewProps {
  state: AppState;
  currentMonthKey?: string;
  summary: MonthSummary;
  onNavigateTab: (tab: string) => void;
  onOpenBudgetModal?: () => void;
  onAllocateSavings?: (amount: number) => void;
  onSaveGoal?: (newGoal: SavingsGoal) => void;
}

export const InvestmentAdvisorView: React.FC<InvestmentAdvisorViewProps> = ({
  state,
  currentMonthKey,
  summary,
  onNavigateTab,
  onOpenBudgetModal,
  onSaveGoal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'allocations' | 'produits' | 'simulateur' | 'recommandations'>('recommandations');
  const [selectedProfileId, setSelectedProfileId] = useState<'prudent' | 'equilibre' | 'dynamique'>('equilibre');
  
  const defaultMonthlyInvest = Math.max(25000, summary.balance > 0 ? summary.balance : 50000);
  const [simMonthlyAmount, setSimMonthlyAmount] = useState<number>(defaultMonthlyInvest);
  const [simYears, setSimYears] = useState<number>(3);
  const [simRate, setSimRate] = useState<number>(7.5);

  const allocationProfiles = generateAllocationProfiles(defaultMonthlyInvest);
  const activeProfile = allocationProfiles.find((p) => p.id === selectedProfileId) || allocationProfiles[1];
  const simulationResult = calculateInvestmentProjection(simMonthlyAmount, simRate, simYears);
  const monthKey = currentMonthKey || (summary ? summary.month : '');
  const recommendations = generateStrategyRecommendations(state, monthKey);

  const recIcon = (icon: string) => {
    switch (icon) {
      case 'concentration':
        return <AlertTriangle size={16} />;
      case 'budget':
        return <ShieldCheck size={16} />;
      case 'savings':
        return <PiggyBank size={16} />;
      case 'target':
        return <Target size={16} />;
      case 'positive':
        return <CheckCircle2 size={16} />;
      default:
        return <Lightbulb size={16} />;
    }
  };

  return (
    <div className="wf-page animate-slideUp space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="wf-title-page">
            Stratégie & Rendement
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--wf-text-secondary)' }}>
            Allocation d'actifs en zone FCFA / UEMOA
          </p>
        </div>
      </div>

      {/* Subtabs Selector (Liquid Glass Pill) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-white/70 rounded-2xl border border-[#EAE5DC] shadow-xs">
        <button
          onClick={() => setActiveSubTab('recommandations')}
          className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'recommandations'
              ? 'btn-sunset'
              : 'text-[#78716C] hover:text-[#18181B]'
          }`}
        >
          Recommandations
        </button>

        <button
          onClick={() => setActiveSubTab('allocations')}
          className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'allocations'
              ? 'btn-sunset'
              : 'text-[#78716C] hover:text-[#18181B]'
          }`}
        >
          Allocations
        </button>

        <button
          onClick={() => setActiveSubTab('produits')}
          className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'produits'
              ? 'btn-sunset'
              : 'text-[#78716C] hover:text-[#18181B]'
          }`}
        >
          Produits UEMOA
        </button>

        <button
          onClick={() => setActiveSubTab('simulateur')}
          className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'simulateur'
              ? 'btn-sunset'
              : 'text-[#78716C] hover:text-[#18181B]'
          }`}
        >
          Simulateur
        </button>
      </div>

      {/* Tab 0: Rule-based recommendations */}
      {activeSubTab === 'recommandations' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb size={15} className="text-[#FF5330]" />
            <h2 className="text-sm font-extrabold text-[#18181B]">
              Recommandations personnalisées
            </h2>
          </div>
          <p className="text-[11px] text-[#635A52]">
            Calculées à partir de vos données réelles (transactions, budget, épargne) du mois.
          </p>

          {recommendations.length === 0 ? (
            <div className="liquid-card p-6 text-center">
              <p className="text-xs text-[#78716C]">Aucune recommandation pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec) => {
                const tone =
                  rec.type === 'alert'
                    ? { bg: 'var(--wf-danger-soft)', color: 'var(--wf-danger)' }
                    : rec.type === 'warning'
                    ? { bg: 'var(--wf-warning-soft)', color: 'var(--wf-warning)' }
                    : rec.type === 'positive'
                    ? { bg: 'var(--wf-success-soft)', color: 'var(--wf-success)' }
                    : { bg: 'var(--wf-info-soft)', color: 'var(--wf-info)' };
                return (
                  <div key={rec.id} className="liquid-card p-4 space-y-2">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: tone.bg, color: tone.color }}
                      >
                        {recIcon(rec.icon)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[13px] font-extrabold text-[#18181B] leading-snug">
                          {rec.title}
                        </h3>
                        <p className="text-[12px] text-[#635A52] leading-relaxed mt-0.5">
                          {rec.message}
                        </p>
                        <div className="flex items-start gap-1.5 mt-2 text-[11px] text-[#78716C]">
                          <CornerDownRight size={12} className="mt-0.5 flex-shrink-0" />
                          <span>
                            <span className="font-bold text-[#18181B]">Pourquoi ? </span>
                            {rec.why}
                          </span>
                        </div>
                        {rec.actionTab && (
                          <button
                            onClick={() => onNavigateTab(rec.actionTab!)}
                            className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#FF5330] hover:underline cursor-pointer"
                          >
                            {rec.actionLabel || 'En savoir plus'}
                            <ChevronRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 1: Allocation Profiles */}
      {activeSubTab === 'allocations' && (
        <div className="space-y-4">
          {/* Profile Choice Grid */}
          <div className="grid grid-cols-3 gap-2">
            {allocationProfiles.map((p) => {
              const isSelected = p.id === selectedProfileId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProfileId(p.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#FF5330] bg-white ring-2 ring-[#FF5330]/20 shadow-xs'
                      : 'border-[#EAE5DC] bg-white/70 hover:border-[#FF5330]/30'
                  }`}
                >
                  <span className="text-xs font-extrabold text-[#18181B] block">
                    {p.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#FF5330] block mt-0.5">
                    {p.expectedAnnualReturn}% / an
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Profile Card (Liquid Glass) */}
          <div className="liquid-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
              <div>
                <h3 className="text-sm font-extrabold text-[#18181B]">
                  Profil {activeProfile.name}
                </h3>
                <span className="text-[11px] text-[#78716C]">
                  Horizon conseillé : {activeProfile.horizon}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                +{activeProfile.expectedAnnualReturn}% cible
              </span>
            </div>

            <p className="text-xs text-[#635A52] leading-relaxed">
              {activeProfile.description}
            </p>

            {/* Slices Breakdown */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8C827A]">
                Répartition mensuelle suggérée
              </h4>

              {activeProfile.slices.map((slice, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-white/80 border border-[#EAE5DC] space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#18181B]">{slice.title}</span>
                    <span className="font-mono font-extrabold text-[#18181B] tabular-nums">
                      {slice.percentage}% ({formatFCFA(slice.suggestedMonthlyAmount)})
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F0EBE1] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FF7A59] to-[#FF5330]"
                      style={{ width: `${slice.percentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#78716C]">
                    {slice.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Products */}
      {activeSubTab === 'produits' && (
        <div className="space-y-3">
          {INVESTMENT_PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className="liquid-card p-5 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#18181B]">
                    {prod.name}
                  </h3>
                  <span className="text-[10px] text-[#78716C]">
                    {prod.providerExamples}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {prod.expectedReturnMin}% - {prod.expectedReturnMax}% / an
                </span>
              </div>

              <p className="text-xs text-[#635A52] leading-relaxed">
                {prod.description}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#F0EBE1] text-[11px] text-[#78716C]">
                <div>
                  <span className="font-semibold text-[#635A52] block">Versement min.</span>
                  <span className="font-mono font-bold text-[#18181B]">
                    {formatFCFA(prod.minimumDeposit)}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-[#635A52] block">Liquidité</span>
                  <span className="font-bold text-[#18181B]">
                    {prod.liquidity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Simulator */}
      {activeSubTab === 'simulateur' && (
        <div className="liquid-card p-5 space-y-4">
          <div className="pb-3 border-b border-[#F0EBE1]">
            <h3 className="text-sm font-extrabold text-[#18181B]">
              Simulateur d'intérêts composés
            </h3>
            <span className="text-[11px] text-[#78716C]">
              Projection de capital cumulé dans le temps
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#635A52]">Versement mensuel</span>
                <span className="font-mono font-bold text-[#FF5330]">{formatFCFA(simMonthlyAmount)}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="500000"
                step="5000"
                value={simMonthlyAmount}
                onChange={(e) => setSimMonthlyAmount(parseFloat(e.target.value))}
                className="w-full accent-[#FF5330] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#635A52]">Durée de placement</span>
                <span className="font-mono font-bold text-[#FF5330]">{simYears} an{simYears > 1 ? 's' : ''}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={simYears}
                onChange={(e) => setSimYears(parseInt(e.target.value))}
                className="w-full accent-[#FF5330] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#635A52]">Taux de rendement estimé</span>
                <span className="font-mono font-bold text-emerald-700">{simRate}% / an</span>
              </div>
              <input
                type="range"
                min="3"
                max="15"
                step="0.5"
                value={simRate}
                onChange={(e) => setSimRate(parseFloat(e.target.value))}
                className="w-full accent-[#FF5330] cursor-pointer"
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="p-4 rounded-2xl bg-white/80 border border-[#EAE5DC] space-y-3 shadow-xs">
            <div>
              <span className="text-[10px] font-bold text-[#8C827A] uppercase block">
                Capital total estimé au terme
              </span>
              <span className="text-3xl font-extrabold font-mono text-[#18181B] tabular-nums block mt-0.5">
                {formatFCFA(simulationResult.finalBalance)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F0EBE1] text-xs">
              <div>
                <span className="text-[10px] text-[#78716C] block">Total épargné</span>
                <span className="font-mono font-bold text-[#635A52]">
                  {formatFCFA(simulationResult.totalDeposited)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#78716C] block">Intérêts générés</span>
                <span className="font-mono font-bold text-emerald-700">
                  +{formatFCFA(simulationResult.totalGains)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
