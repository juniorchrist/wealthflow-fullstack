import { Router } from 'express';
import {
  getSettingsHandler,
  updateSettingsHandler,
  setupPinHandler,
  verifyPinHandler,
  disablePinHandler,
} from '../controllers/settings.controller';
import {
  updateSettingsSchema,
  setupPinSchema,
  verifyPinSchema,
} from '../validators/settings.validator';
import { validate } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(requireAuth);

/**
 * @route   GET /api/settings
 * @desc    Obtenir les paramètres utilisateur
 * @access  Private
 */
router.get('/', getSettingsHandler);

/**
 * @route   PATCH /api/settings
 * @desc    Mettre à jour les paramètres
 * @access  Private
 */
router.patch(
  '/',
  validate(updateSettingsSchema),
  updateSettingsHandler
);

/**
 * @route   POST /api/settings/pin
 * @desc    Configurer le PIN
 * @access  Private
 */
router.post(
  '/pin',
  validate(setupPinSchema),
  setupPinHandler
);

/**
 * @route   POST /api/settings/pin/verify
 * @desc    Vérifier le PIN
 * @access  Private
 */
router.post(
  '/pin/verify',
  validate(verifyPinSchema),
  verifyPinHandler
);

/**
 * @route   DELETE /api/settings/pin
 * @desc    Désactiver le PIN
 * @access  Private
 */
router.delete('/pin', disablePinHandler);

export default router;
