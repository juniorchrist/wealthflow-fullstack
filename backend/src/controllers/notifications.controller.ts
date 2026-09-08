import { Request, Response, NextFunction } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services/notifications.service';
import { NotificationParams, NotificationFilters } from '../validators/notification.validator';

/**
 * Lister les notifications
 * GET /api/notifications
 */
export const listNotificationsHandler = async (
  req: Request<{}, {}, {}, NotificationFilters>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const notifications = await getNotifications(userId, req.query);

    res.status(200).json({
      success: true,
      data: { notifications },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marquer une notification comme lue
 * PATCH /api/notifications/:id/read
 */
export const markAsReadHandler = async (
  req: Request<NotificationParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const notification = await markAsRead(req.params.id, userId);

    res.status(200).json({
      success: true,
      message: 'Notification marquée comme lue',
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marquer toutes les notifications comme lues
 * PATCH /api/notifications/read-all
 */
export const markAllAsReadHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const count = await markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: `${count} notification(s) marquée(s) comme lue(s)`,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer une notification
 * DELETE /api/notifications/:id
 */
export const deleteNotificationHandler = async (
  req: Request<NotificationParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    await deleteNotification(req.params.id, userId);

    res.status(200).json({
      success: true,
      message: 'Notification supprimée avec succès',
    });
  } catch (error) {
    next(error);
  }
};
