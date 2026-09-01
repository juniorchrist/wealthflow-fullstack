import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/categoryValidator';

export async function getCategories(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    res.json(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        icon: c.icon,
        type: c.type,
        isDefault: c.isDefault,
        isActive: c.isActive,
      }))
    );
  } catch (error) {
    next(error);
  }
}

export async function createCategory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const validatedData = createCategorySchema.parse(req.body);

    const category = await prisma.category.create({
      data: {
        id: validatedData.id || undefined,
        userId,
        name: validatedData.name,
        color: validatedData.color,
        icon: validatedData.icon,
        type: validatedData.type,
        isDefault: false,
        isActive: true,
      },
    });

    res.status(201).json({
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      type: category.type,
      isDefault: category.isDefault,
      isActive: category.isActive,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const validatedData = updateCategorySchema.parse(req.body);

    const existing = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Catégorie personnalisée introuvable ou non modifiable.' });
      return;
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: validatedData.name,
        color: validatedData.color,
        icon: validatedData.icon,
        type: validatedData.type,
      },
    });

    res.json({
      id: updated.id,
      name: updated.name,
      color: updated.color,
      icon: updated.icon,
      type: updated.type,
      isDefault: updated.isDefault,
      isActive: updated.isActive,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Catégorie introuvable ou vous n’avez pas l’autorisation de la supprimer.' });
      return;
    }

    // Check if category is used in user's transactions
    const transactionCount = await prisma.transaction.count({
      where: { categoryId: id, userId },
    });

    if (transactionCount > 0) {
      res.status(400).json({
        error: `Impossible de supprimer cette catégorie car elle est utilisée par ${transactionCount} transaction(s). Veuillez d'abord réassigner ou supprimer ces transactions.`,
      });
      return;
    }

    await prisma.category.delete({ where: { id } });

    res.json({ message: 'Catégorie supprimée avec succès', id });
  } catch (error) {
    next(error);
  }
}
