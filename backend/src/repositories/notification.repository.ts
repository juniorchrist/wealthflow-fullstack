import { prisma } from '../lib/prisma';
import { Notification } from '@prisma/client';

export interface NotificationFilters {
  read?: boolean;
  type?: string;
  limit?: number;
}

/**
 * Récupérer toutes les notifications d'un utilisateur
 */
export const getAllNotifications = async (userId: string, filters: NotificationFilters = {}) => {
  const where: any = { userId };

  if (filters.read !== undefined) {
    where.read = filters.read;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  const limit = Math.min(filters.limit || 50, 100);

  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};

/**
 * Marquer une notification comme lue
 */
export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
): Promise<Notification> => {
  // Vérifier que la notification appartient à l'utilisateur
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new Error('Notification non trouvée');
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
};

/**
 * Marquer toutes les notifications comme lues
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<number> => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: { read: true },
  });

  return result.count;
};

/**
 * Supprimer une notification
 */
export const deleteNotification = async (
  notificationId: string,
  userId: string
): Promise<Notification> => {
  // Vérifier que la notification appartient à l'utilisateur
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new Error('Notification non trouvée');
  }

  return prisma.notification.delete({
    where: { id: notificationId },
  });
};

/**
 * Créer une notification (utilisé en interne)
 */
export const createNotification = async (data: {
  userId: string;
  title: string;
  message: string;
  type: string;
}): Promise<Notification> => {
  return prisma.notification.create({
    data,
  });
};
