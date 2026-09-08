import {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationRepo,
} from '../repositories/notification.repository';
import { AppError } from '../middleware/errorHandler';
import { NotificationFilters } from '../validators/notification.validator';

/**
 * Récupérer les notifications
 */
export const getNotifications = async (userId: string, filters: NotificationFilters) => {
  return getAllNotifications(userId, filters);
};

/**
 * Marquer une notification comme lue
 */
export const markAsRead = async (notificationId: string, userId: string) => {
  try {
    return await markNotificationAsRead(notificationId, userId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('non trouvée')) {
      throw new AppError(404, 'Notification non trouvée', 'NOTIFICATION_NOT_FOUND');
    }
    throw error;
  }
};

/**
 * Marquer toutes les notifications comme lues
 */
export const markAllAsRead = async (userId: string) => {
  return markAllNotificationsAsRead(userId);
};

/**
 * Supprimer une notification
 */
export const deleteNotification = async (notificationId: string, userId: string) => {
  try {
    return await deleteNotificationRepo(notificationId, userId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('non trouvée')) {
      throw new AppError(404, 'Notification non trouvée', 'NOTIFICATION_NOT_FOUND');
    }
    throw error;
  }
};
