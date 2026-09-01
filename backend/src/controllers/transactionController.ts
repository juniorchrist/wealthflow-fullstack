import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';
import {
  createTransactionSchema,
  updateTransactionSchema,
} from '../validators/transactionValidator';

export async function getTransactions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { month, categoryId, type } = req.query;

    const where: any = { userId };

    if (month && typeof month === 'string') {
      where.date = { startsWith: month };
    }

    if (categoryId && typeof categoryId === 'string' && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    if (type && typeof type === 'string' && (type === 'expense' || type === 'income')) {
      where.type = type;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    res.json(
      transactions.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        categoryId: tx.categoryId,
        date: tx.date,
        note: tx.note || undefined,
        createdAt: tx.createdAt.getTime(),
      }))
    );
  } catch (error) {
    next(error);
  }
}

export async function getTransactionById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const tx = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!tx) {
      res.status(404).json({ error: 'Transaction introuvable.' });
      return;
    }

    res.json({
      id: tx.id,
      amount: tx.amount,
      type: tx.type,
      categoryId: tx.categoryId,
      date: tx.date,
      note: tx.note || undefined,
      createdAt: tx.createdAt.getTime(),
    });
  } catch (error) {
    next(error);
  }
}

export async function createTransaction(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const validatedData = createTransactionSchema.parse(req.body);

    // Verify category exists and belongs to user or is a default category
    const category = await prisma.category.findFirst({
      where: {
        id: validatedData.categoryId,
        userId,
      },
    });

    if (!category) {
      res.status(400).json({ error: 'Catégorie sélectionnée invalide ou introuvable.' });
      return;
    }

    const createdTx = await prisma.transaction.create({
      data: {
        id: validatedData.id || undefined,
        userId,
        amount: validatedData.amount,
        type: validatedData.type,
        categoryId: validatedData.categoryId,
        date: validatedData.date,
        note: validatedData.note || null,
      },
    });

    res.status(201).json({
      id: createdTx.id,
      amount: createdTx.amount,
      type: createdTx.type,
      categoryId: createdTx.categoryId,
      date: createdTx.date,
      note: createdTx.note || undefined,
      createdAt: createdTx.createdAt.getTime(),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTransaction(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const validatedData = updateTransactionSchema.parse(req.body);

    // Verify existence & ownership
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Transaction introuvable ou accès refusé.' });
      return;
    }

    if (validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: validatedData.categoryId,
          userId,
        },
      });
      if (!category) {
        res.status(400).json({ error: 'Catégorie sélectionnée invalide.' });
        return;
      }
    }

    const updatedTx = await prisma.transaction.update({
      where: { id },
      data: {
        amount: validatedData.amount,
        type: validatedData.type,
        categoryId: validatedData.categoryId,
        date: validatedData.date,
        note: validatedData.note !== undefined ? validatedData.note : undefined,
      },
    });

    res.json({
      id: updatedTx.id,
      amount: updatedTx.amount,
      type: updatedTx.type,
      categoryId: updatedTx.categoryId,
      date: updatedTx.date,
      note: updatedTx.note || undefined,
      createdAt: updatedTx.createdAt.getTime(),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTransaction(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Transaction introuvable ou accès refusé.' });
      return;
    }

    await prisma.transaction.delete({
      where: { id },
    });

    res.json({ message: 'Transaction supprimée avec succès', id });
  } catch (error) {
    next(error);
  }
}
