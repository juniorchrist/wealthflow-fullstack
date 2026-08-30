import { AppNotification, AppState } from '../types';
import { calculateMonthSummary, getCategoryBreakdown } from '../utils/analytics';
import { formatFCFA, getAdjacentMonth } from '../utils/formatters';

export interface StrategyRecommendation {
  id: string;
  type: 'alert' | 'warning' | 'positive' | 'info';
  title: string;
  message: string;
  why: string;
  actionLabel?: string;
  actionTab?: string;
  icon: 'concentration' | 'budget' | 'savings' | 'positive' | 'target' | 'improve';
}

/**
 * Rule-based strategy engine. Every recommendation is computed from the real
 * data transactions/budgets/savings and carries an explicit "why" clause so
 * the reasoning stays explainable. No invented figures.
 */
export function generateStrategyRecommendations(
  state: AppState,
  currentMonthKey: string
): StrategyRecommendation[] {
  const recs: StrategyRecommendation[] = [];
  const summary = calculateMonthSummary(state, currentMonthKey);
  const prevMonthKey = getAdjacentMonth(currentMonthKey, -1);
  const prevSummary = calculateMonthSummary(state, prevMonthKey);
  const breakdown = getCategoryBreakdown(state, currentMonthKey);

  const totalExpense = summary.totalExpense;
  const budgetObj = state.budgets[currentMonthKey];

  // RULE 1: Category concentration > 50% of expenses
  if (totalExpense > 0) {
    breakdown.forEach((b) => {
      if (b.percentage >= 50) {
        const cat = state.categories.find((c) => c.id === b.categoryId);
        recs.push({
          id: `strat-concentration-${b.categoryId}`,
          type: 'alert',
          title: 'Concentration élevée des dépenses',
          message: `Vous avez dépensé ${b.percentage}% de vos dépenses mensuelles (${formatFCFA(b.amount)}) en « ${b.name} ».`,
          why: `Dépenses « ${cat?.name || b.name} » = ${formatFCFA(b.amount)} / total ${formatFCFA(totalExpense)} = ${b.percentage}%.`,
          actionLabel: 'Voir la catégorie',
          actionTab: 'categories',
          icon: 'concentration',
        });
        recs.push({
          id: `strat-rebalance-${b.categoryId}`,
          type: 'info',
          title: 'Budgétiser la catégorie',
          message: `Un plafond mensuel sur « ${b.name} » aiderait à maîtriser ce poste dominant. Votre budget pourrait être réévalué.`,
          why: `Règle : toute catégorie ≥ 50% des dépenses mérite un budget dédié.`,
          actionLabel: 'Ouvrir le budget',
          actionTab: 'budget',
          icon: 'improve',
        });
      }
    });
  }

  // RULE 2: Budget near / over limit
  if (budgetObj && budgetObj.totalBudget > 0) {
    if (summary.totalExpense > summary.budget) {
      const over = summary.totalExpense - summary.budget;
      recs.push({
        id: 'strat-budget-over',
        type: 'alert',
        title: 'Budget dépassé',
        message: `Vos dépenses (${formatFCFA(summary.totalExpense)}) dépassent votre budget de ${formatFCFA(over)}.`,
        why: `Budget mensuel : ${formatFCFA(summary.budget)} ; Dépenses : ${formatFCFA(summary.totalExpense)}.`,
        actionLabel: 'Réévaluer',
        actionTab: 'budget',
        icon: 'budget',
      });
    } else if (summary.budgetUsagePercent >= 80) {
      recs.push({
        id: 'strat-budget-near',
        type: 'warning',
        title: 'Budget bientôt atteint',
        message: `Vous avez utilisé ${summary.budgetUsagePercent}% de votre budget. Il reste ${formatFCFA(Math.max(0, summary.remainingBudget))}.`,
        why: `Dépenses ${formatFCFA(summary.totalExpense)} sur budget ${formatFCFA(summary.budget)} (${summary.budgetUsagePercent}%).`,
        actionLabel: 'Suivre le budget',
        actionTab: 'budget',
        icon: 'budget',
      });
    }
  }

  // Per-category budget near/over
  if (budgetObj && budgetObj.categoryBudgets) {
    Object.entries(budgetObj.categoryBudgets).forEach(([catId, limit]) => {
      if (limit <= 0) return;
      const spent = breakdown.find((b) => b.categoryId === catId)?.amount || 0;
      const cat = state.categories.find((c) => c.id === catId);
      if (spent >= limit * 0.8) {
        recs.push({
          id: `strat-catbudget-${catId}`,
          type: 'warning',
          title: `Budget « ${cat?.name || 'Catégorie'} » presque atteint`,
          message: `Dépensé ${formatFCFA(spent)} sur ${formatFCFA(limit)} (${Math.round((spent / limit) * 100)}%).`,
          why: `Transactions de cette catégorie sur le mois courant.`,
          actionLabel: 'Voir le budget',
          actionTab: 'budget',
          icon: 'budget',
        });
      }
    });
  }

  // RULE 3: Savings low relative to income
  if (summary.totalIncome > 0) {
    const capacity = summary.totalIncome - summary.totalExpense;
    const savingsRate = Math.round((capacity / summary.totalIncome) * 100);
    if (capacity <= 0) {
      recs.push({
        id: 'strat-savings-none',
        type: 'warning',
        title: 'Épargne faible / négative',
        message: `Vos dépenses (${formatFCFA(summary.totalExpense)}) absorbent l'essentiel de vos revenus (${formatFCFA(summary.totalIncome)}).`,
        why: `Revenus - Dépenses = ${formatFCFA(capacity)} (taux d'épargne ${savingsRate}%).`,
        actionLabel: 'Voir l’épargne',
        actionTab: 'goals',
        icon: 'savings',
      });
    } else if (savingsRate < 10) {
      recs.push({
        id: 'strat-savings-low',
        type: 'info',
        title: 'Taux d’épargne modéré',
        message: `Vous épargnez environ ${savingsRate}% de vos revenus. Un objectif de 10-20% est couramment conseillé.`,
        why: `Capacité d'épargne ${formatFCFA(capacity)} / revenus ${formatFCFA(summary.totalIncome)} = ${savingsRate}%.`,
        actionLabel: 'Créer un objectif',
        actionTab: 'goals',
        icon: 'savings',
      });
    }
  }

  // RULE 4: Spend lower than previous period (positive)
  if (prevSummary.totalExpense > 0 && totalExpense < prevSummary.totalExpense) {
    const drop = Math.round(((prevSummary.totalExpense - totalExpense) / prevSummary.totalExpense) * 100);
    recs.push({
      id: 'strat-positive-drop',
      type: 'positive',
      title: 'Baisse des dépenses constatée',
      message: `Vos dépenses actuelles (${formatFCFA(totalExpense)}) sont en baisse de ${drop}% par rapport à la période précédente.`,
      why: `Période précédente : ${formatFCFA(prevSummary.totalExpense)} → Période actuelle : ${formatFCFA(totalExpense)}.`,
      actionTab: 'analytics',
      actionLabel: 'Voir les analyses',
      icon: 'positive',
    });
  }

  // RULE 5: Savings goal behind schedule
  state.savingsGoals.forEach((goal) => {
    if (goal.targetAmount > 0 && goal.currentAmount < goal.targetAmount) {
      const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
      const ageDays = (Date.now() - goal.createdAt) / 86400000;
      if (ageDays > 20 && pct < 40) {
        recs.push({
          id: `strat-goal-behind-${goal.id}`,
          type: 'warning',
          title: `Objectif en retard : ${goal.title}`,
          message: `Vous êtes à ${pct}% de votre objectif de ${formatFCFA(goal.targetAmount)} après plus de 20 jours.`,
          why: `Actuel ${formatFCFA(goal.currentAmount)} / cible ${formatFCFA(goal.targetAmount)} = ${pct}%.`,
          actionLabel: 'Voir l’épargne',
          actionTab: 'goals',
          icon: 'target',
        });
      }
    }
  });

  if (recs.length === 0) {
    recs.push({
      id: 'strat-healthy',
      type: 'positive',
      title: 'Situation équilibrée',
      message: 'Aucune alerte majeure détectée. Vos finances sont globalement sous contrôle ce mois-ci.',
      why: 'Aucune règle de vigilance (concentration, budget, épargne, tendance) n’a été déclenchée.',
      icon: 'positive',
    });
  }

  return recs;
}
