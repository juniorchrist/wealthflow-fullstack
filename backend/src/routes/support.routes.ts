import { Router } from 'express';
import {
  createSupportTicketHandler,
  checkBanStatusHandler,
} from '../controllers/support.controller';

const router = Router();

/**
 * @route   POST /api/support/tickets
 * @desc    Envoyer un message au centre d'aide / support
 * @access  Public
 */
router.post('/tickets', createSupportTicketHandler);

/**
 * @route   GET /api/support/ban-status
 * @desc    Vérifier si un email est banni et obtenir le motif exact
 * @access  Public
 */
router.get('/ban-status', checkBanStatusHandler);

export default router;
