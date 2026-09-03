import React from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Compass,
  Lightbulb,
  Percent,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';

export const StrategyView: React.FC = () => {
  const { totalIncome, totalExpenses, totalSaved, savingsRate, formatCurrency, setActiveTab } =
    useWealth();

  // Financial Health Calculation
  const healthScore = Math.min(100, Math.max(50, Math.round(savingsRate * 1.5 + 35)));

  return (
    <div id="strategy-view" className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
            Stratégie Financière
          </h2>
          <p className="text-xs text-[#6F6F73] mt-0.5">
            Diagnostic personnalisé et plan d’action basé sur vos flux réels
          </p>
        </div>

        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#10B981]/10 text-[#10B981] text-xs font-bold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>Profil Équilibré & Résilient</span>
        </span>
      </div>

      {/* 2. Diagnostic Score Hero Banner */}
      <div className="p-3.5 rounded-2xl bg-[#18181B] text-white shadow-sm flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF5330]">
            SCORE DE SANTÉ FINANCIÈRE
          </span>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-black num-tabular text-white">{healthScore}</h3>
            <span className="text-sm text-white/60">/ 100</span>
          </div>
          <p className="text-[11px] text-white/80 leading-relaxed max-w-sm">
            Vos flux indiquent une forte discipline avec un taux d'épargne de <strong>{savingsRate}%</strong>.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('savings')}
          className="px-3 py-1.5 rounded-xl bg-[#FF5330] hover:bg-[#E84524] active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex-shrink-0"
        >
          Mes objectifs
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Recommandations orientées action (Pourquoi ? Que pouvez-vous faire ?) */}
      <div className="space-y-2.5">
        <h3 className="font-extrabold text-sm text-[#18181B] px-1">Plan d'action recommandé</h3>

        {/* Action 1: Alimentation & Dépenses courantes */}
        <div className="p-3 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF5330]/10 flex items-center justify-center text-[#FF5330]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-[#18181B]">
                Optimisation des dépenses courantes
              </h4>
              <p className="text-[10px] text-[#6F6F73]">Poste le plus important du mois</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs divide-y divide-[#F0F0F0]">
            <div className="pt-0.5">
              <strong className="text-[#18181B] block mb-0.5">Pourquoi ?</strong>
              <p className="text-[#6F6F73] leading-relaxed">
                Vos achats alimentaires et sorties représentent une part sensible de vos flux variables.
              </p>
            </div>

            <div className="pt-1.5">
              <strong className="text-[#FF5330] block mb-0.5">Que pouvez-vous faire ?</strong>
              <p className="text-[#52525B] leading-relaxed">
                Fixez un plafond hebdomadaire pour l'alimentation afin d'épargner 25 000 FCFA supplémentaires chaque mois.
              </p>
            </div>
          </div>
        </div>

        {/* Action 2: Règle 50 / 30 / 20 */}
        <div className="p-3 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-[#18181B]">
                Application de la règle 50 / 30 / 20
              </h4>
              <p className="text-[10px] text-[#6F6F73]">Équilibre patrimonial optimal</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs divide-y divide-[#F0F0F0]">
            <div className="pt-0.5">
              <strong className="text-[#18181B] block mb-0.5">Pourquoi ?</strong>
              <p className="text-[#6F6F73] leading-relaxed">
                Allouer 50% aux besoins vitaux, 30% aux envies et 20% à l'épargne sécurise l'avenir sans frustration.
              </p>
            </div>

            <div className="pt-1.5">
              <strong className="text-[#10B981] block mb-0.5">Que pouvez-vous faire ?</strong>
              <p className="text-[#52525B] leading-relaxed">
                Vérifiez la jauge de votre budget dans l'onglet Budget pour ajuster vos plafonds par catégorie.
              </p>
            </div>
          </div>
        </div>

        {/* Action 3: Automatisation de l'épargne */}
        <div className="p-3 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#18181B]/10 flex items-center justify-center text-[#18181B]">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-[#18181B]">
                Payer son épargne en premier
              </h4>
              <p className="text-[10px] text-[#6F6F73]">Le principe d'or de la fintech</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs divide-y divide-[#F0F0F0]">
            <div className="pt-0.5">
              <strong className="text-[#18181B] block mb-0.5">Pourquoi ?</strong>
              <p className="text-[#6F6F73] leading-relaxed">
                Épargner ce qui reste à la fin du mois échoue souvent face aux dépenses imprévues.
              </p>
            </div>

            <div className="pt-1.5">
              <strong className="text-[#18181B] block mb-0.5">Que pouvez-vous faire ?</strong>
              <p className="text-[#52525B] leading-relaxed">
                Alimentez vos tirelires dès le 1er ou le 5 du mois via les versements rapides sur vos objectifs.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
