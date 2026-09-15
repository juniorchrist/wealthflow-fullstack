import { getTotalIncome, getTotalExpenses, getRecentTransactions } from '../repositories/transaction.repository';
import { prisma } from '../lib/prisma';

/**
 * Obtenir le résumé du dashboard
 */
export const getDashboardSummary = async (userId: string) => {
  // Récupérer les données du mois en cours
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Calculer les totaux
  const [
    monthlyIncome,
    monthlyExpenses,
    totalIncome,
    totalExpenses,
    accounts,
    savingsGoals,
    recentTransactions,
    unreadNotifications,
  ] = await Promise.all([
    getTotalIncome(userId, firstDayOfMonth, lastDayOfMonth),
    getTotalExpenses(userId, firstDayOfMonth, lastDayOfMonth),
    getTotalIncome(userId),
    getTotalExpenses(userId),
    prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        type: true,
        initialBalance: true,
        isDefault: true,
      },
    }),
    prisma.savingsGoal.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        targetAmount: true,
        deadline: true,
        icon: true,
        color: true,
        deposits: {
          select: {
            amount: true,
          },
        },
      },
      take: 5,
    }),
    getRecentTransactions(userId, 5),
    prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    }),
  ]);

  // Récupérer l'intégralité de l'épargne déposée
  const allSavingsDeposits = await prisma.savingsDeposit.findMany({
    where: {
      goal: {
        userId,
      },
    },
    select: {
      amount: true,
    },
  });
  const totalSaved = allSavingsDeposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  // Calculer le solde disponible réel (initialBalance + revenus - dépenses - épargne)
  const totalInitialBalance = accounts.reduce((sum, account) => sum + account.initialBalance, 0);
  const balance = totalInitialBalance + totalIncome - totalExpenses - totalSaved;

  // Calculer currentAmount pour chaque goal
  const goalsWithAmount = savingsGoals.map((goal) => {
    const currentAmount = goal.deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
    const progress = goal.targetAmount > 0 ? Math.round((currentAmount / goal.targetAmount) * 100) : 0;
    
    return {
      id: goal.id,
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount,
      progress,
      deadline: goal.deadline,
      icon: goal.icon,
      color: goal.color,
    };
  });

  // Calculer le budget mensuel
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { userId: null, isDefault: true },
        { userId },
      ],
      type: 'expense',
    },
    select: {
      budgetLimit: true,
    },
  });

  const monthlyBudgetTotal = categories.reduce((sum, cat) => sum + cat.budgetLimit, 0);
  const monthlyBudgetRemaining = Math.max(0, monthlyBudgetTotal - monthlyExpenses);
  const budgetPercentage = monthlyBudgetTotal > 0 
    ? Math.min(100, Math.round((monthlyExpenses / monthlyBudgetTotal) * 100))
    : 0;

  return {
    balance,
    totalIncome: monthlyIncome,
    totalExpenses: monthlyExpenses,
    totalSaved,
    budget: {
      total: monthlyBudgetTotal,
      spent: monthlyExpenses,
      remaining: monthlyBudgetRemaining,
      percentage: budgetPercentage,
    },
    savingsGoals: goalsWithAmount,
    recentTransactions,
    unreadNotificationsCount: unreadNotifications,
  };
};
