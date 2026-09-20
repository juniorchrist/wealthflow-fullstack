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
  const actualExpenseSum = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = actualExpenseSum > 0 ? actualExpenseSum : (totalExpenses > 0 ? totalExpenses : 0);

  const categoryBreakdown = expenseCategories
    .map((cat) => {
      const spent = transactions
        .filter(
          (t) =>
            (t.categoryId === cat.id || t.category === cat.name) && t.type === 'expense'
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;
      return {
        ...cat,
        spent,
        percentage,
      };
    })
    .sort((a, b) => b.spent - a.spent);

  const categoriesWithSpending = categoryBreakdown.filter((cat) => cat.spent > 0);
  const hasExpenses = totalSpent > 0 && categoriesWithSpending.length > 0;

  // N'utiliser que les vraies données — pas de fallback fictif
  const hasRealChartData = chartData && chartData.some((d) => d.revenus > 0 || d.depenses > 0);
  const rawChartData = hasRealChartData ? chartData : [];
  const displayChartData =
    timeframe === '3'
      ? rawChartData.slice(-3)
      : timeframe === '6'
      ? rawChartData.slice(-6)
      : rawChartData;

  const maxBarVal = displayChartData.length > 0
    ? Math.max(...displayChartData.map((d) => Math.max(d.revenus, d.depenses)), 1)
    : 1;

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
                  className="h-full bg-[#FF5330] rounded-full transition-all duration-300"
                  style={{ width: `${cat.spent > 0 ? Math.max(2, cat.percentage) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Observation conditionnelle */}
        <div className="p-2.5 rounded-xl bg-[#FFFBF9] border border-[#FF5330]/20 text-[11px] text-[#52525B] leading-relaxed flex items-start gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-[#FF5330] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#18181B]">Observation :</strong>{' '}
            {!hasExpenses ? (
              <span>
                Aucune dépense enregistrée pour le moment. Dès vos premières saisies, cette observation mettra automatiquement en valeur vos principaux postes de dépenses du mois.
              </span>
            ) : categoriesWithSpending.length === 1 ? (
              <span>
                Le poste <em>{categoriesWithSpending[0].name}</em> concentre la totalité de vos dépenses ({categoriesWithSpending[0].percentage}%) ce mois-ci ({formatCurrency(categoriesWithSpending[0].spent)}).
              </span>
            ) : (
              <span>
                Les postes <em>{categoriesWithSpending[0].name}</em> ({categoriesWithSpending[0].percentage}%) et{' '}
                <em>{categoriesWithSpending[1].name}</em> ({categoriesWithSpending[1].percentage}%) concentrent la majorité de vos dépenses ce mois-ci (
                {categoriesWithSpending[0].percentage + categoriesWithSpending[1].percentage}% du total).
              </span>
            )}
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
        {displayChartData.length === 0 ? (
          /* État vide — aucune transaction enregistrée */
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <BarChart2 className="w-10 h-10 text-[#E4E4E7]" />
            <p className="text-xs font-bold text-[#18181B]">Aucune donnée disponible</p>
            <p className="text-[11px] text-[#6F6F73] max-w-xs">
              Commencez à enregistrer des revenus et dépenses. Le graphique apparaîtra automatiquement.
            </p>
          </div>
        ) : (
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
                          className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                          style={{ width: `${revPercent}%` }}
                        />
                      </div>
                      <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#EF4444] rounded-full transition-all duration-300"
                          style={{ width: `${depPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Short Interpretation — uniquement si données réelles */}
        {displayChartData.length > 0 && (() => {
          const totalRev = displayChartData.reduce((s, d) => s + d.revenus, 0);
          const totalDep = displayChartData.reduce((s, d) => s + d.depenses, 0);
          const isSurplus = totalRev >= totalDep;
          return (
            <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed flex items-start gap-2 ${
              isSurplus
                ? 'bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534]'
                : 'bg-[#FFF1F2] border border-[#FFE4E6] text-[#991B1B]'
            }`}>
              {isSurplus
                ? <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0 mt-0.5" />
                : <TrendingDown className="w-3.5 h-3.5 text-[#EF4444] flex-shrink-0 mt-0.5" />
              }
              <div>
                {isSurplus ? (
                  <><strong className="text-[#18181B]">Tendance saine :</strong> Vos revenus ({formatCurrency(totalRev)}) restent supérieurs à vos dépenses ({formatCurrency(totalDep)}) sur la période sélectionnée.</>  
                ) : (
                  <><strong className="text-[#18181B]">Attention :</strong> Vos dépenses ({formatCurrency(totalDep)}) dépassent vos revenus ({formatCurrency(totalRev)}) sur la période. Ajustez vos catégories pour rétablir l'équilibre.</>
                )}
              </div>
            </div>
          );
        })()}
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
