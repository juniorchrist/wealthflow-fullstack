import { Router } from 'express';
import {
  adminLoginHandler,
  listAdminUsersHandler,
  deleteAdminUserHandler,
  listBansHandler,
  deleteBanHandler,
  listSupportTicketsHandler,
  updateSupportTicketHandler,
  broadcastNotificationHandler,
  maintenancePurgeHandler,
} from '../controllers/admin.controller';
import { updateSystemSettingsHandler } from '../controllers/system.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * @route   POST /api/admin/login
 * @desc    Connexion sécurisée administrateur
 * @access  Public
 */
router.post('/login', authLimiter, adminLoginHandler);

// ============================================================================
// TOUTES LES ROUTES CI-DESSOUS REQUIÈRENT LE RÔLE ADMIN EN BASE DE DONNÉES
// ============================================================================
router.use(requireAuth, requireAdmin);

/**
 * @route   GET /api/admin/users
 * @desc    Obtenir tous les utilisateurs réels avec leurs données financières
 */
router.get('/users', listAdminUsersHandler);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Supprimer et bannir un utilisateur avec motif réel
 */
router.delete('/users/:id', deleteAdminUserHandler);

/**
 * @route   POST /api/admin/notifications/broadcast
 * @desc    Diffuser une notification à un ou tous les utilisateurs
 */
router.post('/notifications/broadcast', broadcastNotificationHandler);

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
 * @desc    Mettre à jour un ticket et notifier automatiquement l'utilisateur
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
