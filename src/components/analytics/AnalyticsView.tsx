import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  PieChart,
  PiggyBank,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { initialChartData } from '../../data/initialData';
import { CategoryIcon } from '../common/CategoryIcon';

export const AnalyticsView: React.FC = () => {
  const {
    categories,
    transactions,
    chartData,
    formatCurrency,
    savingsRate,
    totalIncome,
    totalExpenses,
    totalSaved,
  } = useWealth();

  const [timeframe, setTimeframe] = useState<'12' | '6' | '3'>('6');

  // Calculate actual spending per category
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const totalSpent =
    transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) || totalExpenses || 1;

  const categoryBreakdown = expenseCategories
    .map((cat) => {
      const spent = transactions
        .filter(
          (t) =>
            (t.categoryId === cat.id || t.category === cat.name) && t.type === 'expense'
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = Math.round((spent / totalSpent) * 100);
      return {
        ...cat,
        spent,
        percentage,
      };
    })
    .sort((a, b) => b.spent - a.spent);

  const rawChartData = chartData && chartData.length > 0 ? chartData : initialChartData;
  const displayChartData =
    timeframe === '3'
      ? rawChartData.slice(-3)
      : timeframe === '6'
      ? rawChartData.slice(-6)
      : rawChartData;

  const maxBarVal = Math.max(
    ...displayChartData.map((d) => Math.max(d.revenus, d.depenses)),
    100000
  );

  return (
    <div id="analytics-view" className="space-y-5 sm:space-y-6 animate-in fade-in duration-200 px-4 py-4 pb-24 lg:p-0">
      
      {/* 1. Header & Timeframe */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
            Analyses Financières
          </h2>
          <p className="text-xs text-[#6F6F73] mt-0.5">
            Comprenez vos habitudes financières question par question
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="inline-flex rounded-xl bg-white border border-[#E8E8E8] p-1 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setTimeframe('6')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeframe === '6'
                ? 'bg-[#18181B] text-white shadow-xs'
                : 'text-[#6F6F73]'
            }`}
          >
            6 mois
          </button>
          <button
            onClick={() => setTimeframe('3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeframe === '3'
                ? 'bg-[#18181B] text-white shadow-xs'
                : 'text-[#6F6F73]'
            }`}
          >
            3 mois
          </button>
          <button
            onClick={() => setTimeframe('12')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeframe === '12'
                ? 'bg-[#18181B] text-white shadow-xs'
                : 'text-[#6F6F73]'
            }`}
          >
            12 mois
          </button>
        </div>
      </div>

      {/* QUESTION 1: Où part votre argent ? */}
      <section className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E8E8E8] shadow-2xs space-y-3">
        <div className="border-b border-[#F0F0F0] pb-2">
          <span className="text-[10px] font-extrabold text-[#FF5330] uppercase tracking-wider block">
            QUESTION 1
          </span>
          <h3 className="text-sm sm:text-base font-black text-[#18181B]">
            Où part votre argent ?
          </h3>
          <p className="text-[11px] text-[#6F6F73] mt-0.5">
            Répartition exacte de vos dépenses du mois
          </p>
        </div>

        {/* Categories Breakdown List */}
        <div className="space-y-2">
          {categoryBreakdown.slice(0, 5).map((cat) => (
            <div key={cat.id} className="space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-5 h-5 rounded-md bg-[#F7F7F7] flex items-center justify-center text-[#18181B] flex-shrink-0">
                    <CategoryIcon name={cat.name} className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-[#18181B] truncate">{cat.name}</span>
                </div>
                <div className="text-right flex items-center space-x-2 flex-shrink-0">
                  <span className="font-extrabold text-[#18181B] num-tabular">
                    {formatCurrency(cat.spent)}
                  </span>
                  <span className="text-[11px] font-bold text-[#6F6F73] w-9 text-right">
                    {cat.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-[#F0F0F0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF5330] rounded-full"
                  style={{ width: `${Math.max(2, cat.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Short Interpretation */}
        <div className="p-2.5 rounded-xl bg-[#FFFBF9] border border-[#FF5330]/20 text-[11px] text-[#52525B] leading-relaxed flex items-start gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-[#FF5330] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#18181B]">Observation :</strong> Les postes{' '}
            <em>{categoryBreakdown[0]?.name || 'Alimentation'}</em> et{' '}
            <em>{categoryBreakdown[1]?.name || 'Logement'}</em> concentrent la majorité de vos dépenses.
          </div>
        </div>
      </section>

      {/* QUESTION 2: Comment évoluent vos dépenses ? */}
      <section className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E8E8E8] shadow-2xs space-y-3">
        <div className="border-b border-[#F0F0F0] pb-2">
          <span className="text-[10px] font-extrabold text-[#10B981] uppercase tracking-wider block">
            QUESTION 2
          </span>
          <h3 className="text-sm sm:text-base font-black text-[#18181B]">
            Comment évoluent vos flux ?
          </h3>
          <p className="text-[11px] text-[#6F6F73] mt-0.5">
            Comparatif direct : Revenus vs Dépenses
          </p>
        </div>

        {/* Bar Chart Visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-end space-x-3 text-[11px] font-semibold">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-xs bg-[#10B981]" />
              <span>Revenus</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-xs bg-[#EF4444]" />
              <span>Dépenses</span>
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {displayChartData.map((d) => {
              const revPercent = Math.min(100, Math.round((d.revenus / maxBarVal) * 100));
              const depPercent = Math.min(100, Math.round((d.depenses / maxBarVal) * 100));

              return (
                <div key={d.month} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#18181B]">
                    <span>{d.month}</span>
                    <span className="text-[11px] text-[#6F6F73] num-tabular">
                      +{formatCurrency(d.revenus)} / -{formatCurrency(d.depenses)}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#10B981] rounded-full"
                        style={{ width: `${revPercent}%` }}
                      />
                    </div>
                    <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#EF4444] rounded-full"
                        style={{ width: `${depPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Short Interpretation */}
        <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-[11px] text-[#166534] leading-relaxed flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#18181B]">Tendance saine :</strong> Vos entrées restent
            systématiquement supérieures à vos sorties mensuelles.
          </div>
        </div>
      </section>

      {/* QUESTION 3: Votre taux d'épargne ? */}
      <section className="p-3.5 sm:p-4 rounded-2xl bg-[#18181B] text-white shadow-sm space-y-3">
        <div className="border-b border-white/10 pb-2">
          <span className="text-[10px] font-extrabold text-[#FF5330] uppercase tracking-wider block">
            QUESTION 3
          </span>
          <h3 className="text-sm sm:text-base font-black text-white">
            Quel est votre taux d'épargne ?
          </h3>
          <p className="text-[11px] text-white/60 mt-0.5">
            Pourcentage de vos revenus effectivement mis de côté
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70">Taux d'épargne moyen</p>
            <p className="text-2xl sm:text-3xl font-black text-[#FF5330] num-tabular">
              {savingsRate}%
            </p>
          </div>

          <div className="text-right text-xs">
            <span className="text-white/60 block">Recommandé</span>
            <span className="font-extrabold text-[#10B981]">20% à 30%</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/10 text-[11px] text-white/90 leading-relaxed flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#FF5330] flex-shrink-0 mt-0.5" />
          <div>
            Votre ratio actuel de <strong>{savingsRate}%</strong> est au-dessus du standard
            financier de 20%, garantissant la résilience de votre patrimoine.
          </div>
        </div>
      </section>

    </div>
  );
};
