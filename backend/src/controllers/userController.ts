import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';

export async function deleteAccount(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    // Prisma cascade delete removes all associated relations
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: 'Compte et l’ensemble de ses données supprimés avec succès.' });
  } catch (error) {
    next(error);
  }
}

export async function exportUserData(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const [user, transactions, categories, budgets, savingsGoals, notifications, settings] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true,
            numero: true,
            createdAt: true,
          },
        }),
        prisma.transaction.findMany({
          where: { userId },
          orderBy: { date: 'desc' },
        }),
        prisma.category.findMany({
          where: { userId },
        }),
        prisma.budget.findMany({
          where: { userId },
        }),
        prisma.savingsGoal.findMany({
          where: { userId },
          include: { milestones: true },
        }),
        prisma.notification.findMany({
          where: { userId },
        }),
        prisma.userSettings.findUnique({
          where: { userId },
        }),
      ]);

    const budgetMap: Record<string, any> = {};
    for (const b of budgets) {
      budgetMap[b.month] = {
        month: b.month,
        totalBudget: b.totalBudget,
        savingsTarget: b.savingsTarget,
        categoryBudgets: b.categoryBudgets,
        createdAt: b.createdAt.getTime(),
        updatedAt: b.updatedAt.getTime(),
      };
    }

    res.json({
      app: 'WealthFlow',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      user,
      data: {
        transactions: transactions.map((t) => ({
          id: t.id,
          amount: t.amount,
          type: t.type,
          categoryId: t.categoryId,
          date: t.date,
          note: t.note || undefined,
          createdAt: t.createdAt.getTime(),
        })),
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          color: c.color,
          icon: c.icon,
          type: c.type,
          isDefault: c.isDefault,
          isActive: c.isActive,
        })),
        budgets: budgetMap,
        savingsGoals: savingsGoals.map((g) => ({
          id: g.id,
          month: g.month,
          title: g.title,
          targetAmount: g.targetAmount,
          currentAmount: g.currentAmount,
          deadline: g.deadline || undefined,
          category: g.category || undefined,
          milestones: g.milestones.map((m) => ({
            id: m.id,
            title: m.title,
            targetAmount: m.targetAmount,
            isCompleted: m.isCompleted,
            completedAt: m.completedAt || null,
          })),
          createdAt: g.createdAt.getTime(),
        })),
        notifications: notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          read: n.read,
          createdAt: n.createdAt.getTime(),
        })),
        settings,
      },
    });
  } catch (error) {
    next(error);
  }
}
