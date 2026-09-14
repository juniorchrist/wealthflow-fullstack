import { Router } from 'express';
import {
  listAdminUsersHandler,
  deleteAdminUserHandler,
  listBansHandler,
  deleteBanHandler,
  listSupportTicketsHandler,
  updateSupportTicketHandler,
  maintenancePurgeHandler,
} from '../controllers/admin.controller';
import { updateSystemSettingsHandler } from '../controllers/system.controller';

const router = Router();

/**
 * @route   GET /api/admin/users
 * @desc    Obtenir tous les utilisateurs réels
 */
router.get('/users', listAdminUsersHandler);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Supprimer et bannir un utilisateur avec motif réel
 */
router.delete('/users/:id', deleteAdminUserHandler);

/**
 * @route   GET /api/admin/bans
 * @desc    Lister tous les comptes bannis et leurs motifs
 */
router.get('/bans', listBansHandler);

/**
 * @route   DELETE /api/admin/bans/:id
 * @desc    Révoquer un bannissement
 */
router.delete('/bans/:id', deleteBanHandler);

/**
 * @route   GET /api/admin/support/tickets
 * @desc    Lister tous les tickets d'assistance
 */
router.get('/support/tickets', listSupportTicketsHandler);

/**
 * @route   PATCH /api/admin/support/tickets/:id
 * @desc    Mettre à jour un ticket
 */
router.patch('/support/tickets/:id', updateSupportTicketHandler);

/**
 * @route   PUT /api/admin/settings
 * @desc    Mettre à jour les paramètres globaux (maintenance, CGU, confidentialité)
 */
router.put('/settings', updateSystemSettingsHandler);

/**
 * @route   POST /api/admin/maintenance/cache-clear
 * @desc    Purger le cache et tester la santé de la base
 */
router.post('/maintenance/cache-clear', maintenancePurgeHandler);

export default router;
