import { Router } from 'express';
import {
  listNotificationsHandler,
  markAsReadHandler,
  markAllAsReadHandler,
  deleteNotificationHandler,
} from '../controllers/notifications.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(requireAuth);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Marquer toutes les notifications comme lues
 * @access  Private
 */
router.patch('/read-all', markAllAsReadHandler);

/**
 * @route   GET /api/notifications
 * @desc    Lister les notifications
 * @access  Private
 */
router.get('/', listNotificationsHandler as any);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Marquer une notification comme lue
 * @access  Private
 */
router.patch('/:id/read', markAsReadHandler);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Supprimer une notification
 * @access  Private
 */
router.delete('/:id', deleteNotificationHandler);

export default router;
