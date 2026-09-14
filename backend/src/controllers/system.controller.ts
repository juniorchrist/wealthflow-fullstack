import { Request, Response, NextFunction } from 'express';
import { getOrCreateSystemSettings, updateSystemSettings } from '../services/system.service';

/**
 * Récupérer les paramètres publics (maintenance, message, CGU, confidentialité)
 * GET /api/system/settings
 */
export const getSystemSettingsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = await getOrCreateSystemSettings();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour les paramètres système (Admin)
 * PUT /api/admin/settings
 */
export const updateSystemSettingsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await updateSystemSettings(req.body);

    res.status(200).json({
      success: true,
      message: 'Paramètres système mis à jour avec succès',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
