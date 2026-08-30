import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { AppState, MonthSummary } from '../types';
import { formatFCFA, formatMonthLabel } from '../utils/formatters';
import {
  getCategoryBreakdown,
  getMonthlyHistoryTrend,
  generateSmartInsights,
} from '../utils/analytics';
import { TrendingUp, TrendingDown, PieChart, Sparkles } from 'lucide-react';

interface AnalyticsViewProps {
  state: AppState;
  currentMonthKey: string;
  summary: MonthSummary;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  state,
  currentMonthKey,
  summary,
}) => {
  const [chartView, setChartView] = useState<'categories' | 'monthly'>('categories');

  const categoryBreakdown = getCategoryBreakdown(state, currentMonthKey);
  const monthlyTrend = getMonthlyHistoryTrend(state, 6);
  const insights = generateSmartInsights(state, currentMonthKey);

  return (
    <div className="wf-page animate-slideUp space-y-6">
      {/* Header */}
      <div>
        <h1 className="wf-title-page">Analyses & Tendances</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--wf-text-secondary)' }}>
          Statistiques de consommation pour {formatMonthLabel(currentMonthKey)}
        </p>
      </div>

      {/* 4 Statistical Metrics (2 col mobile, 4 col tablet/desktop) */}
      <div className="wf-stats-row">
        <div className="liquid-card p-4">
          <span className="text-xs font-semibold block" style={{ color: 'var(--wf-text-tertiary)' }}>
            Moyenne / jour
          </span>
          <span className="wf-amount-medium block mt-1" style={{ color: 'var(--wf-text)' }}>
            {formatFCFA(summary.dailyAverage, { compact: true })}
          </span>
        </div>

        <div className="liquid-card p-4">
          <span className="text-xs font-semibold block" style={{ color: 'var(--wf-text-tertiary)' }}>
            Plus grosse dépense
          </span>
          <span className="wf-amount-medium block mt-1 truncate" style={{ color: 'var(--wf-text)' }}>
            {summary.maxExpense ? formatFCFA(summary.maxExpense.amount, { compact: true }) : '0 FCFA'}
          </span>
        </div>

        <div className="liquid-card p-4">
          <span className="text-xs font-semibold block" style={{ color: 'var(--wf-text-tertiary)' }}>
            Poste principal
          </span>
          <span className="text-sm font-bold block mt-1 truncate" style={{ color: 'var(--wf-text)' }}>
            {summary.dominantCategory ? summary.dominantCategory.category?.name : 'Aucun'}
          </span>
          {summary.dominantCategory && (
            <span className="text-xs font-mono font-semibold" style={{ color: 'var(--wf-primary)' }}>
              {summary.dominantCategory.percentage}% du total
            </span>
          )}
        </div>

        <div className="liquid-card p-4">
          <span className="text-xs font-semibold block" style={{ color: 'var(--wf-text-tertiary)' }}>
            Capacité d'épargne
          </span>
          <span
            className="wf-amount-medium block mt-1"
            style={{
              color: summary.savingsCapacity > 0 ? 'var(--wf-success)' : 'var(--wf-text-tertiary)',
            }}
          >
            {formatFCFA(summary.savingsCapacity, { compact: true })}
          </span>
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="liquid-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b flex-wrap gap-2" style={{ borderColor: 'var(--wf-border)' }}>
          <h2 className="wf-title-section text-sm sm:text-base">
            {chartView === 'categories' ? 'Dépenses par catégorie' : 'Historique des 6 derniers mois'}
          </h2>

          <div
            className="flex items-center p-1 rounded-xl"
            style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}
          >
            <button
              onClick={() => setChartView('categories')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all touch-target"
              style={{
                background: chartView === 'categories' ? 'var(--wf-primary)' : 'transparent',
                color: chartView === 'categories' ? 'white' : 'var(--wf-text-secondary)',
              }}
            >
              Catégories
            </button>
            <button
              onClick={() => setChartView('monthly')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all touch-target"
              style={{
                background: chartView === 'monthly' ? 'var(--wf-primary)' : 'transparent',
                color: chartView === 'monthly' ? 'white' : 'var(--wf-text-secondary)',
              }}
            >
              6 mois
            </button>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'categories' ? (
              <BarChart
                data={categoryBreakdown.slice(0, 6)}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--wf-border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#8C827A', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: 'var(--wf-border)' }}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fill: '#8C827A', fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`${formatFCFA(Number(val))}`, 'Dépense']}
                  contentStyle={{
                    backgroundColor: 'rgba(24, 24, 27, 0.95)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="amount" fill="var(--wf-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart
                data={monthlyTrend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--wf-border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#8C827A', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: 'var(--wf-border)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#8C827A', fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`${formatFCFA(Number(val))}`, 'Dépenses']}
                  contentStyle={{
                    backgroundColor: 'rgba(24, 24, 27, 0.95)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="Dépenses"
                  stroke="var(--wf-primary)"
                  fill="var(--wf-primary)"
                  fillOpacity={0.12}
                  strokeWidth={2.5}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Insights List */}
      {insights.length > 0 && (
        <div className="liquid-card p-5 space-y-3.5">
          <h2 className="wf-title-section text-sm flex items-center gap-2">
            <Sparkles size={16} style={{ color: 'var(--wf-primary)' }} />
            <span>Indicateurs & Observations</span>
          </h2>

          <div className="space-y-2.5 pt-1">
            {insights.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl space-y-1"
                style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}
              >
                <h3 className="text-xs font-bold" style={{ color: 'var(--wf-text)' }}>
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--wf-text-secondary)' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
