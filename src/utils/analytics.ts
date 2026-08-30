import { AppState, Category, Insight, MonthSummary, Transaction } from '../types';
import { formatFCFA, getAdjacentMonth } from './formatters';

/**
 * Calculate complete monthly summary for a given month
 */
export function calculateMonthSummary(state: AppState, monthKey: string): MonthSummary {
  const budgetObj = state.budgets[monthKey];
  const budget = budgetObj ? budgetObj.totalBudget : 0;
  const hasBudget = Boolean(budgetObj && budgetObj.totalBudget > 0);

  // Filter transactions for this month
  const monthTransactions = state.transactions.filter((tx) => tx.date.startsWith(monthKey));

  let totalIncome = 0;
  let totalExpense = 0;
  let maxExpense: Transaction | null = null;
  const categoryExpenses: Record<string, number> = {};

  monthTransactions.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpense += tx.amount;
      categoryExpenses[tx.categoryId] = (categoryExpenses[tx.categoryId] || 0) + tx.amount;

      if (!maxExpense || tx.amount > maxExpense.amount) {
        maxExpense = tx;
      }
    }
  });

  const balance = totalIncome - totalExpense;
  const remainingBudget = hasBudget ? budget - totalExpense : balance;
  const budgetUsagePercent = hasBudget && budget > 0 ? Math.round((totalExpense / budget) * 100) : 0;
  const savingsCapacity = Math.max(0, totalIncome - totalExpense);

  // Calculate total saved from completed savings goals for this month
  let totalSaved = 0;
  state.savingsGoals.forEach((goal) => {
    if (goal.month === monthKey || goal.month === 'global') {
      goal.milestones.forEach((m) => {
        if (m.isCompleted && m.completedAt && m.completedAt.startsWith(monthKey)) {
          totalSaved += m.targetAmount;
        }
      });
    }
  });

  // Calculate daily average (based on days passed in the month)
  const [year, month] = monthKey.split('-').map(Number);
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysPassed = isCurrentMonth ? Math.max(1, now.getDate()) : daysInMonth;
  const dailyAverage = totalExpense > 0 ? Math.round(totalExpense / daysPassed) : 0;

  // Dominant category
  let dominantCategory: MonthSummary['dominantCategory'] = null;
  let maxCatAmount = 0;
  let dominantCatId = '';

  Object.entries(categoryExpenses).forEach(([catId, amount]) => {
    if (amount > maxCatAmount) {
      maxCatAmount = amount;
      dominantCatId = catId;
    }
  });

  if (dominantCatId && totalExpense > 0) {
    const catObj = state.categories.find((c) => c.id === dominantCatId) || null;
    dominantCategory = {
      category: catObj,
      amount: maxCatAmount,
      percentage: Math.round((maxCatAmount / totalExpense) * 100),
    };
  }

  return {
    month: monthKey,
    budget,
    hasBudget,
    totalIncome,
    totalExpense,
    balance,
    remainingBudget,
    budgetUsagePercent,
    savingsCapacity,
    totalSaved,
    dailyAverage,
    maxExpense,
    dominantCategory,
  };
}

/**
 * Generate intelligent, sourced insights with direct "why" and data context
 */
export function generateSmartInsights(state: AppState, currentMonthKey: string): Insight[] {
  const insights: Insight[] = [];
  const currentSummary = calculateMonthSummary(state, currentMonthKey);
  const prevMonthKey = getAdjacentMonth(currentMonthKey, -1);
  const prevSummary = calculateMonthSummary(state, prevMonthKey);

  const [year, month] = currentMonthKey.split('-').map(Number);
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysPassed = isCurrentMonth ? Math.max(1, now.getDate()) : daysInMonth;
  const daysRemaining = daysInMonth - daysPassed;

  // 1. Alert: No budget defined
  if (!currentSummary.hasBudget) {
    insights.push({
      id: 'ins-no-budget',
      type: 'warning',
      title: 'Aucun budget défini ce mois-ci',
      description: 'Définissez votre plafond de dépenses pour activer le suivi en direct et les prévisions de fin de mois.',
      source: 'Donnée manquante : Planification financière non initialisée.',
      tag: 'estimate',
      actionType: 'add_budget',
    });
  }

  // 2. Budget Burn Rate & Exceed Alert
  if (currentSummary.hasBudget && currentSummary.budget > 0) {
    if (currentSummary.totalExpense > currentSummary.budget) {
      const overAmount = currentSummary.totalExpense - currentSummary.budget;
      insights.push({
        id: 'ins-budget-exceeded',
        type: 'alert',
        title: `Dépassement de budget : +${formatFCFA(overAmount)}`,
        description: `Vous avez consommé ${currentSummary.budgetUsagePercent}% de votre budget mensuel alloué.`,
        source: `Calcul : Dépenses (${formatFCFA(currentSummary.totalExpense)}) > Budget initial (${formatFCFA(currentSummary.budget)}).`,
        amount: overAmount,
        tag: 'calculated',
      });
    } else if (currentSummary.budgetUsagePercent >= 80 && daysRemaining > 5) {
      insights.push({
        id: 'ins-budget-burn-rate',
        type: 'warning',
        title: 'Rythme de dépenses élevé',
        description: `Vous avez déjà utilisé ${currentSummary.budgetUsagePercent}% de votre budget alors qu'il reste encore ${daysRemaining} jours dans le mois.`,
        source: `Calcul : ${formatFCFA(currentSummary.totalExpense)} dépensés sur ${daysPassed} jours (${formatFCFA(currentSummary.dailyAverage)}/jour).`,
        tag: 'estimate',
      });
    }
  }

  // 3. Outlier Expense Alert (Single expense > 35% of all month expenses or > 50 000 FCFA)
  if (currentSummary.maxExpense && currentSummary.totalExpense > 0) {
    const maxTx = currentSummary.maxExpense;
    const cat = state.categories.find((c) => c.id === maxTx.categoryId);
    const catName = cat?.name || 'Catégorie';
    const txPercent = Math.round((maxTx.amount / currentSummary.totalExpense) * 100);

    if (txPercent >= 35 && maxTx.amount >= 30000) {
      insights.push({
        id: 'ins-outlier-expense',
        type: 'alert',
        title: `Dépense majeure détectée : ${formatFCFA(maxTx.amount)}`,
        description: `La transaction « ${maxTx.note || catName} » représente à elle seule ${txPercent}% de vos dépenses totales du mois.`,
        source: `Donnée réelle : Transaction du ${maxTx.date} en ${catName}.`,
        amount: maxTx.amount,
        tag: 'real',
      });
    }
  }

  // 4. Category Evolution & Savings Opportunities (Comparison with previous month)
  const currentMonthTxs = state.transactions.filter((tx) => tx.date.startsWith(currentMonthKey) && tx.type === 'expense');
  const prevMonthTxs = state.transactions.filter((tx) => tx.date.startsWith(prevMonthKey) && tx.type === 'expense');

  state.categories.forEach((cat) => {
    if (cat.type === 'income') return;
    const currCatTotal = currentMonthTxs
      .filter((tx) => tx.categoryId === cat.id)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const prevCatTotal = prevMonthTxs
      .filter((tx) => tx.categoryId === cat.id)
      .reduce((sum, tx) => sum + tx.amount, 0);

    // If spending in a discretionary category dropped significantly
    if (prevCatTotal >= 20000 && currCatTotal < prevCatTotal * 0.75 && daysPassed >= 15) {
      const diff = prevCatTotal - currCatTotal;
      const suggestTransfer = Math.round(diff * 0.5);
      insights.push({
        id: `ins-cat-savings-${cat.id}`,
        type: 'recommendation',
        title: `Opportunité d'épargne : ${cat.name}`,
        description: `Vos dépenses en « ${cat.name} » ont diminué de ${Math.round(((prevCatTotal - currCatTotal) / prevCatTotal) * 100)}% par rapport au mois passé. Vous pourriez placer ${formatFCFA(suggestTransfer)} vers vos objectifs d'épargne.`,
        source: `Comparaison mensuelle : ${formatFCFA(currCatTotal)} ce mois contre ${formatFCFA(prevCatTotal)} le mois précédent.`,
        amount: suggestTransfer,
        tag: 'estimate',
        actionType: 'add_savings',
      });
    }
  });

  // 5. Positive Capacity Insight
  if (currentSummary.savingsCapacity > 50000) {
    insights.push({
      id: 'ins-savings-capacity',
      type: 'positive',
      title: `Capacité d'épargne positive : ${formatFCFA(currentSummary.savingsCapacity)}`,
      description: `Vos revenus actuels dépassent vos dépenses cumulées. Considérez de valider une échéance de votre plan d'épargne.`,
      source: `Calcul : Revenus (${formatFCFA(currentSummary.totalIncome)}) - Dépenses (${formatFCFA(currentSummary.totalExpense)}).`,
      amount: currentSummary.savingsCapacity,
      tag: 'calculated',
      actionType: 'add_savings',
    });
  }

  return insights;
}

/**
 * Breakdown of expenses by category with percentages for Donut and Bar charts
 */
export function getCategoryBreakdown(state: AppState, monthKey: string) {
  const monthTxs = state.transactions.filter(
    (tx) => tx.date.startsWith(monthKey) && tx.type === 'expense'
  );

  const totalExpense = monthTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const catMap: Record<string, { category: Category; amount: number; count: number }> = {};

  monthTxs.forEach((tx) => {
    if (!catMap[tx.categoryId]) {
      const cat = state.categories.find((c) => c.id === tx.categoryId) || {
        id: tx.categoryId,
        name: 'Autre',
        color: '#64748B',
        icon: 'HelpCircle',
        type: 'expense',
      };
      catMap[tx.categoryId] = { category: cat, amount: 0, count: 0 };
    }
    catMap[tx.categoryId].amount += tx.amount;
    catMap[tx.categoryId].count += 1;
  });

  const breakdown = Object.values(catMap).map((item) => ({
    categoryId: item.category.id,
    name: item.category.name,
    color: item.category.color,
    icon: item.category.icon,
    amount: item.amount,
    count: item.count,
    percentage: totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0,
  }));

  // Sort descending by amount
  return breakdown.sort((a, b) => b.amount - a.amount);
}

/**
 * Multi-month trend comparison data for historical charts
 */
export function getMonthlyHistoryTrend(state: AppState, count = 6) {
  const months: string[] = [];
  const current = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(current.getFullYear(), current.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${y}-${m}`);
  }

  return months.map((mKey) => {
    const summary = calculateMonthSummary(state, mKey);
    const [y, m] = mKey.split('-');
    const dateObj = new Date(Number(y), Number(m) - 1, 1);
    const shortLabel = dateObj.toLocaleDateString('fr-FR', { month: 'short' });

    return {
      monthKey: mKey,
      name: shortLabel.charAt(0).toUpperCase() + shortLabel.slice(1),
      Dépenses: summary.totalExpense,
      Revenus: summary.totalIncome,
      Budget: summary.budget,
      Solde: summary.balance,
      Épargne: summary.totalSaved,
    };
  });
}
