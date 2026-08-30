import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';
import { upsertBudgetSchema } from '../validators/budgetValidator';

export async function getBudgets(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const budgets = await prisma.budget.findMany({
      where: { userId },
      orderBy: { month: 'desc' },
    });

    const budgetMap: Record<string, any> = {};
    for (const b of budgets) {
      budgetMap[b.month] = {
        month: b.month,
        totalBudget: b.totalBudget,
        savingsTarget: b.savingsTarget,
        categoryBudgets: b.categoryBudgets || {},
        createdAt: b.createdAt.getTime(),
        updatedAt: b.updatedAt.getTime(),
      };
    }

    res.json(budgetMap);
  } catch (error) {
    next(error);
  }
}

export async function getBudgetByMonth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { month } = req.params;

    const budget = await prisma.budget.findUnique({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });

    if (!budget) {
      res.status(404).json({ error: 'Aucun budget défini pour ce mois.' });
      return;
    }

    res.json({
      month: budget.month,
      totalBudget: budget.totalBudget,
      savingsTarget: budget.savingsTarget,
      categoryBudgets: budget.categoryBudgets || {},
      createdAt: budget.createdAt.getTime(),
      updatedAt: budget.updatedAt.getTime(),
    });
  } catch (error) {
    next(error);
  }
}

export async function upsertBudget(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const validatedData = upsertBudgetSchema.parse(req.body);

    const budget = await prisma.budget.upsert({
      where: {
        userId_month: {
          userId,
          month: validatedData.month,
        },
      },
      create: {
        userId,
        month: validatedData.month,
        totalBudget: validatedData.totalBudget,
        savingsTarget: validatedData.savingsTarget || 0,
        categoryBudgets: validatedData.categoryBudgets || {},
      },
      update: {
        totalBudget: validatedData.totalBudget,
        savingsTarget: validatedData.savingsTarget !== undefined ? validatedData.savingsTarget : undefined,
        categoryBudgets: validatedData.categoryBudgets !== undefined ? validatedData.categoryBudgets : undefined,
      },
    });

    res.json({
      month: budget.month,
      totalBudget: budget.totalBudget,
      savingsTarget: budget.savingsTarget,
      categoryBudgets: budget.categoryBudgets || {},
      createdAt: budget.createdAt.getTime(),
      updatedAt: budget.updatedAt.getTime(),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteBudget(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { month } = req.params;

    const existing = await prisma.budget.findUnique({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Budget introuvable.' });
      return;
    }

    await prisma.budget.delete({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });

    res.json({ message: 'Budget supprimé avec succès', month });
  } catch (error) {
    next(error);
  }
}
