import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  getMeHandler,
} from '../controllers/auth.controller';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from '../validators/auth.validator';
import { validate } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  registerHandler
);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  loginHandler
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renouveler les tokens avec un refresh token
 * @access  Public
 */
router.post(
  '/refresh',
  validate(refreshSchema),
  refreshHandler
);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion (supprimer le refresh token)
 * @access  Private
 */
router.post(
  '/logout',
  requireAuth,
  validate(logoutSchema),
  logoutHandler
);

/**
 * @route   GET /api/auth/me
 * @desc    Obtenir le profil de l'utilisateur courant
 * @access  Private
 */
router.get(
  '/me',
  requireAuth,
  getMeHandler
);

export default router;
