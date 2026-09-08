import { prisma } from '../lib/prisma';

/**
 * Obtenir les données mensuelles complètes
 */
export const getMonthlyData = async (userId: string, month: string) => {
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59);

  // Récupérer toutes les transactions du mois
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: {
        select: {
          name: true,
          icon: true,
          color: true,
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  // Calculer les totaux
  const income = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expenses = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const savings = transactions
    .filter((tx) => tx.type === 'savings_deposit')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return {
    month,
    income,
    expenses,
    savings,
    balance: income - expenses,
    transactionCount: transactions.length,
    transactions,
  };
};

/**
 * Répartition par catégorie
 */
export const getCategoriesBreakdown = async (
  userId: string,
  month: string,
  type: 'income' | 'expense'
) => {
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
      },
    },
  });

  // Grouper par catégorie
  const categoryMap: Record<
    string,
    {
      categoryId: string;
      categoryName: string;
      icon: string;
      color: string;
      amount: number;
      count: number;
    }
  > = {};

  transactions.forEach((tx) => {
    const catId = tx.category.id;
    if (!categoryMap[catId]) {
      categoryMap[catId] = {
        categoryId: catId,
        categoryName: tx.category.name,
        icon: tx.category.icon,
        color: tx.category.color,
        amount: 0,
        count: 0,
      };
    }
    categoryMap[catId].amount += tx.amount;
    categoryMap[catId].count += 1;
  });

  const categories = Object.values(categoryMap);
  const total = categories.reduce((sum, cat) => sum + cat.amount, 0);

  // Ajouter les pourcentages
  const categoriesWithPercentage = categories.map((cat) => ({
    ...cat,
    percentage: total > 0 ? Math.round((cat.amount / total) * 100) : 0,
  }));

  // Trier par montant décroissant
  categoriesWithPercentage.sort((a, b) => b.amount - a.amount);

  return {
    month,
    type,
    total,
    categories: categoriesWithPercentage,
  };
};

/**
 * Revenus mensuels
 */
export const getMonthlyIncome = async (userId: string, month: string): Promise<number> => {
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59);

  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'income',
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return result._sum.amount || 0;
};

/**
 * Dépenses mensuelles
 */
export const getMonthlyExpenses = async (userId: string, month: string): Promise<number> => {
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59);

  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'expense',
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return result._sum.amount || 0;
};

/**
 * Épargne mensuelle
 */
export const getMonthlySavings = async (userId: string, month: string): Promise<number> => {
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59);

  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'savings_deposit',
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return result._sum.amount || 0;
};

/**
 * Données annuelles (12 mois)
 */
export const getYearlyData = async (userId: string, year: number) => {
  const months = [];

  for (let month = 1; month <= 12; month++) {
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [incomeResult, expensesResult, savingsResult] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'income',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'expense',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'savings_deposit',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
    ]);

    const income = incomeResult._sum.amount || 0;
    const expenses = expensesResult._sum.amount || 0;
    const savings = savingsResult._sum.amount || 0;

    months.push({
      month: monthStr,
      income,
      expenses,
      savings,
      balance: income - expenses,
    });
  }

  // Calculer les totaux annuels
  const yearlyIncome = months.reduce((sum, m) => sum + m.income, 0);
  const yearlyExpenses = months.reduce((sum, m) => sum + m.expenses, 0);
  const yearlySavings = months.reduce((sum, m) => sum + m.savings, 0);

  return {
    year,
    months,
    totals: {
      income: yearlyIncome,
      expenses: yearlyExpenses,
      savings: yearlySavings,
      balance: yearlyIncome - yearlyExpenses,
    },
  };
};
