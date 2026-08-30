import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';

export async function getNotifications(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(
      notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        source: n.source || undefined,
        read: n.read,
        tab: n.tab || undefined,
        amount: n.amount || undefined,
        createdAt: n.createdAt.getTime(),
      }))
    );
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsRead(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const notif = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notif) {
      res.status(404).json({ error: 'Notification introuvable.' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json({
      id: updated.id,
      read: updated.read,
    });
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsAsRead(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    res.json({ message: 'Toutes les notifications ont été marquées comme lues.' });
  } catch (error) {
    next(error);
  }
}

export async function deleteNotification(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const notif = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notif) {
      res.status(404).json({ error: 'Notification introuvable.' });
      return;
    }

    await prisma.notification.delete({ where: { id } });

    res.json({ message: 'Notification supprimée avec succès', id });
  } catch (error) {
    next(error);
  }
}
