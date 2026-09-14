import { Router } from 'express';
import {
  listAdminUsersHandler,
  deleteAdminUserHandler,
} from '../controllers/admin.controller';

const router = Router();

/**
 * @route   GET /api/admin/users
 * @desc    Obtenir tous les utilisateurs réels
 * @access  Public / Admin
 */
router.get('/users', listAdminUsersHandler);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Supprimer un utilisateur
 * @access  Public / Admin
 */
router.delete('/users/:id', deleteAdminUserHandler);

export default router;
