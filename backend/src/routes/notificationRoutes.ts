import { Router } from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../controllers/notificationController';
import { authMiddleware } from '../middleware/auth';

export const notificationRoutes = Router();

notificationRoutes.use(authMiddleware);

notificationRoutes.get('/', getNotifications);
notificationRoutes.put('/:id/read', markNotificationAsRead);
notificationRoutes.put('/read-all', markAllNotificationsAsRead);
notificationRoutes.delete('/:id', deleteNotification);
