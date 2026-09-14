import { Router } from 'express';
import { getSystemSettingsHandler } from '../controllers/system.controller';

const router = Router();

/**
 * @route   GET /api/system/settings
 * @desc    Obtenir l'état de la maintenance, message, CGU et politique de confidentialité
 * @access  Public
 */
router.get('/settings', getSystemSettingsHandler);

export default router;
