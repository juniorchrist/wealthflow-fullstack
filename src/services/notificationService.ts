import { AppNotification, AppState, NotificationType } from '../types';
import { calculateMonthSummary, getCategoryBreakdown } from '../utils/analytics';
import { formatFCFA, getAdjacentMonth, getTodayDateString } from '../utils/formatters';

/**
 * Generate a deterministic notification id so that re-running generation
 * over the same data does not create duplicates.
 */
function notifId(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return `notif-${hash.toString(36)}`;
}

function mk(
  id: string,
  type: NotificationType,
  title: string,
  message: string,
  opts: { source?: string; tab?: string; amount?: number } = {}
): AppNotification {
  return {
    id,
    type,
    title,
    message,
    source: opts.source,
    tab: opts.tab,
    amount: opts.amount,
    createdAt: Date.now(),
    read: false,
  };
}

/**
 * Recompute the full set of live notifications from the current data.
 * Existing persisted notifications (like a dismissed/read one) are preserved
 * only when they still map to an active generated notification; new alerts
 * are prepended. This keeps exactly one coherent source of truth.
 */
export function generateNotifications(state: AppState, currentMonthKey: string): AppNotification[] {
  const generated: AppNotification[] = [];
  const summary = calculateMonthSummary(state, currentMonthKey);
  const today = getTodayDateString();

  // ---- BUDGET ----
  const budgetObj = state.budgets[currentMonthKey];
  if (budgetObj && budgetObj.totalBudget > 0) {
    if (!summary.hasBudget) {
      // budget record exists but total is 0
    }
    if (summary.totalExpense > summary.budget) {
      const over = summary.totalExpense - summary.budget;
      generated.push(
        mk(
          notifId(`budget-exceed-${currentMonthKey}`),
          'budget',
          `Dépassement de budget : +${formatFCFA(over)}`,
          `Vous avez déjà consommé ${summary.budgetUsagePercent}% de votre budget mensuel.`,
          { source: `Dépenses (${formatFCFA(summary.totalExpense)}) > Budget (${formatFCFA(summary.budget)}).`, tab: 'budget', amount: over }
        )
      );
    } else if (summary.budgetUsagePercent >= 80) {
      generated.push(
        mk(
          notifId(`budget-high-${currentMonthKey}`),
          'budget',
          `Budget presque atteint (${summary.budgetUsagePercent}%)`,
          `Il vous reste ${formatFCFA(Math.max(0, summary.remainingBudget))} sur ${formatFCFA(summary.budget)}.`,
          { source: `Taux d'utilisation calculé à partir des transactions du mois.`, tab: 'budget' }
        )
      );
    }
  }

  // Per-category budget alerts
  if (budgetObj && budgetObj.categoryBudgets) {
    const breakdown = getCategoryBreakdown(state, currentMonthKey);
    Object.entries(budgetObj.categoryBudgets).forEach(([catId, limit]) => {
      const spent = breakdown.find((b) => b.categoryId === catId)?.amount || 0;
      if (limit > 0 && spent >= limit * 0.8) {
        const cat = state.categories.find((c) => c.id === catId);
        generated.push(
          mk(
            notifId(`cat-budget-${catId}-${currentMonthKey}`),
            'budget',
            `Budget « ${cat?.name || 'Catégorie'} » presque atteint`,
            `Dépensé ${formatFCFA(spent)} sur ${formatFCFA(limit)} (${Math.round((spent / limit) * 100)}%).`,
            { source: `Transactions du mois pour cette catégorie.`, tab: 'budget' }
          )
        );
      }
    });
  }

  // ---- TRANSACTION ----
  if (summary.maxExpense && summary.totalExpense > 0) {
    const maxTx = summary.maxExpense;
    if (maxTx.amount >= 50000) {
      generated.push(
        mk(
          notifId(`big-tx-${maxTx.id}`),
          'transaction',
          `Dépense majeure : ${formatFCFA(maxTx.amount)}`,
          `« ${maxTx.note || 'Opération'} » du ${maxTx.date}.`,
          { source: `Transaction réelle enregistrée.`, tab: 'history', amount: maxTx.amount }
        )
      );
    }
  }

  // ---- SAVINGS ----
  state.savingsGoals.forEach((goal) => {
    if (goal.targetAmount > 0) {
      const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
      if (pct >= 100) {
        generated.push(
          mk(
            notifId(`goal-done-${goal.id}`),
            'savings',
            `Objectif atteint : ${goal.title}`,
            `Vous avez atteint 100% de votre objectif de ${formatFCFA(goal.targetAmount)}.`,
            { source: `Progression calculée sur l'objectif.`, tab: 'goals', amount: goal.currentAmount }
          )
        );
      } else if (pct < 25 && goal.createdAt > Date.now() - 0) {
        // low savings progress hint (only meaningful if goal older than a day)
      }
    }
  });

  // General savings-capacity recommendation
  if (summary.savingsCapacity > 50000) {
    generated.push(
      mk(
        notifId(`savings-capacity-${currentMonthKey}`),
        'savings',
        `Capacité d'épargne : ${formatFCFA(summary.savingsCapacity)}`,
        `Vos revenus dépassent vos dépenses. Pensez à épargner la différence.`,
        { source: `Revenus (${formatFCFA(summary.totalIncome)}) - Dépenses (${formatFCFA(summary.totalExpense)}).`, tab: 'goals', amount: summary.savingsCapacity }
      )
    );
  }

  // ---- STRATEGY ----
  const breakdown = getCategoryBreakdown(state, currentMonthKey);
  const totalExpense = summary.totalExpense;
  breakdown.forEach((b) => {
    if (totalExpense > 0 && b.percentage >= 50) {
      const cat = state.categories.find((c) => c.id === b.categoryId);
      generated.push(
        mk(
          notifId(`concentration-${b.categoryId}-${currentMonthKey}`),
          'strategy',
          `Forte concentration : ${b.name} (${b.percentage}%)`,
          `Cette catégorie représente ${formatFCFA(b.amount)} sur ${formatFCFA(totalExpense)} de dépenses.`,
          { source: `Répartition des dépenses du mois.`, tab: 'invest', amount: b.amount }
        )
      );
    }
  });

  const prevMonthKey = getAdjacentMonth(currentMonthKey, -1);
  const prevSummary = calculateMonthSummary(state, prevMonthKey);
  if (prevSummary.totalExpense > 0 && totalExpense < prevSummary.totalExpense) {
    const drop = Math.round(((prevSummary.totalExpense - totalExpense) / prevSummary.totalExpense) * 100);
    generated.push(
      mk(
        notifId(`pos-drop-${currentMonthKey}`),
        'strategy',
        `Baisse des dépenses : -${drop}%`,
        `Vos dépenses actuelles (${formatFCFA(totalExpense)}) sont inférieures au mois précédent.`,
        { source: `Comparaison avec ${formatFCFA(prevSummary.totalExpense)} sur la période précédente.`, tab: 'analytics' }
      )
    );
  }

  // Merge with previously persisted notifications, keeping those that still
  // match an active generated notification so read/dismissed state survives.
  const existing = state.notifications || [];
  const activeIds = new Set(generated.map((g) => g.id));
  const kept: AppNotification[] = [];
  existing.forEach((n) => {
    if (activeIds.has(n.id)) kept.push(n);
  });

  // Preserve read state on re-generated ids
  const merged = generated.map((g) => {
    const prev = existing.find((e) => e.id === g.id);
    return prev ? { ...g, read: prev.read } : g;
  });

  const keptMerged = kept.map((k) => merged.find((m) => m.id === k.id) || k);
  const newOnes = merged.filter((m) => !kept.some((k) => k.id === m.id));

  // Keep newest first, avoid storing stale old notifications
  return [...newOnes, ...keptMerged];
}

export function nextDashboardTip(state: AppState, currentMonthKey: string): AppNotification | null {
  const notifs = generateNotifications(state, currentMonthKey);
  const tips = notifs.filter((n) => n.type === 'strategy' || n.type === 'budget');
  return tips.length > 0 ? tips[0] : null;
}
