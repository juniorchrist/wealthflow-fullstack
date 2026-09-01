import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';
import {
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
  contributeSavingsSchema,
} from '../validators/savingsValidator';

export async function getSavingsGoals(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const goals = await prisma.savingsGoal.findMany({
      where: { userId },
      include: {
        milestones: {
          orderBy: { targetAmount: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(
      goals.map((g) => ({
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
      }))
    );
  } catch (error) {
    next(error);
  }
}

export async function getSavingsGoalById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const goal = await prisma.savingsGoal.findFirst({
      where: { id, userId },
      include: {
        milestones: {
          orderBy: { targetAmount: 'asc' },
        },
      },
    });

    if (!goal) {
      res.status(404).json({ error: 'Objectif d’épargne introuvable.' });
      return;
    }

    res.json({
      id: goal.id,
      month: goal.month,
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline || undefined,
      category: goal.category || undefined,
      milestones: goal.milestones.map((m) => ({
        id: m.id,
        title: m.title,
        targetAmount: m.targetAmount,
        isCompleted: m.isCompleted,
        completedAt: m.completedAt || null,
      })),
      createdAt: goal.createdAt.getTime(),
    });
  } catch (error) {
    next(error);
  }
}

export async function createSavingsGoal(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const validatedData = createSavingsGoalSchema.parse(req.body);

    const goal = await prisma.savingsGoal.create({
      data: {
        id: validatedData.id || undefined,
        userId,
        month: validatedData.month || 'global',
        title: validatedData.title,
        targetAmount: validatedData.targetAmount,
        currentAmount: validatedData.currentAmount || 0,
        deadline: validatedData.deadline || null,
        category: validatedData.category || null,
        milestones: {
          create: (validatedData.milestones || []).map((m) => ({
            id: m.id || undefined,
            title: m.title,
            targetAmount: m.targetAmount,
            isCompleted: m.isCompleted || false,
            completedAt: m.completedAt || null,
          })),
        },
      },
      include: {
        milestones: true,
      },
    });

    res.status(201).json({
      id: goal.id,
      month: goal.month,
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline || undefined,
      category: goal.category || undefined,
      milestones: goal.milestones.map((m) => ({
        id: m.id,
        title: m.title,
        targetAmount: m.targetAmount,
        isCompleted: m.isCompleted,
        completedAt: m.completedAt || null,
      })),
      createdAt: goal.createdAt.getTime(),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSavingsGoal(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const validatedData = updateSavingsGoalSchema.parse(req.body);

    const existing = await prisma.savingsGoal.findFirst({
      where: { id, userId },
      include: { milestones: true },
    });

    if (!existing) {
      res.status(404).json({ error: 'Objectif d’épargne introuvable.' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      // If milestones provided, replace them
      if (validatedData.milestones) {
        await tx.savingsMilestone.deleteMany({ where: { savingsGoalId: id } });
        await tx.savingsMilestone.createMany({
          data: validatedData.milestones.map((m) => ({
            id: m.id || undefined,
            savingsGoalId: id,
            title: m.title,
            targetAmount: m.targetAmount,
            isCompleted: m.isCompleted || false,
            completedAt: m.completedAt || null,
          })),
        });
      }

      return tx.savingsGoal.update({
        where: { id },
        data: {
          title: validatedData.title,
          targetAmount: validatedData.targetAmount,
          currentAmount: validatedData.currentAmount,
          deadline: validatedData.deadline !== undefined ? validatedData.deadline : undefined,
          category: validatedData.category !== undefined ? validatedData.category : undefined,
          month: validatedData.month,
        },
        include: {
          milestones: true,
        },
      });
    });

    res.json({
      id: updated.id,
      month: updated.month,
      title: updated.title,
      targetAmount: updated.targetAmount,
      currentAmount: updated.currentAmount,
      deadline: updated.deadline || undefined,
      category: updated.category || undefined,
      milestones: updated.milestones.map((m) => ({
        id: m.id,
        title: m.title,
        targetAmount: m.targetAmount,
        isCompleted: m.isCompleted,
        completedAt: m.completedAt || null,
      })),
      createdAt: updated.createdAt.getTime(),
    });
  } catch (error) {
    next(error);
  }
}

export async function contributeSavings(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { amount, milestoneId } = contributeSavingsSchema.parse(req.body);

    const goal = await prisma.savingsGoal.findFirst({
      where: { id, userId },
      include: { milestones: true },
    });

    if (!goal) {
      res.status(404).json({ error: 'Objectif d’épargne introuvable.' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (milestoneId) {
        const milestone = await tx.savingsMilestone.findFirst({
          where: { id: milestoneId, savingsGoalId: id },
        });
        if (!milestone) {
          throw Object.assign(new Error('Jalon introuvable pour cet objectif.'), { status: 404 });
        }
        await tx.savingsMilestone.update({
          where: { id: milestoneId },
          data: {
            isCompleted: true,
            completedAt: new Date().toISOString().split('T')[0],
          },
        });
      }

      return tx.savingsGoal.update({
        where: { id },
        data: { currentAmount: { increment: amount } },
        include: { milestones: true },
      });
    });

    res.json({
      id: updated.id,
      month: updated.month,
      title: updated.title,
      targetAmount: updated.targetAmount,
      currentAmount: updated.currentAmount,
      deadline: updated.deadline || undefined,
      category: updated.category || undefined,
      milestones: updated.milestones.map((m) => ({
        id: m.id,
        title: m.title,
        targetAmount: m.targetAmount,
        isCompleted: m.isCompleted,
        completedAt: m.completedAt || null,
      })),
      createdAt: updated.createdAt.getTime(),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSavingsGoal(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.savingsGoal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Objectif d’épargne introuvable.' });
      return;
    }

    await prisma.savingsGoal.delete({ where: { id } });

    res.json({ message: 'Objectif supprimé avec succès', id });
  } catch (error) {
    next(error);
  }
}
