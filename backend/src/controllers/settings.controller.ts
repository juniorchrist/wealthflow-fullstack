import { Request, Response, NextFunction } from 'express';
import {
  getUserSettings,
  updateUserSettings,
  setupPin,
  verifyPin,
  disablePin,
} from '../services/settings.service';
import { UpdateSettingsInput, SetupPinInput, VerifyPinInput } from '../validators/settings.validator';

/**
 * Obtenir les paramètres utilisateur
 * GET /api/settings
 */
export const getSettingsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const settings = await getUserSettings(userId);

    res.status(200).json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour les paramètres utilisateur
 * PATCH /api/settings
 */
export const updateSettingsHandler = async (
  req: Request<{}, {}, UpdateSettingsInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const settings = await updateUserSettings(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Paramètres mis à jour avec succès',
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Configurer le PIN
 * POST /api/settings/pin
 */
export const setupPinHandler = async (
  req: Request<{}, {}, SetupPinInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    await setupPin(userId, req.body.pin);

    res.status(200).json({
      success: true,
      message: 'PIN configuré avec succès',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Vérifier le PIN
 * POST /api/settings/pin/verify
 */
export const verifyPinHandler = async (
  req: Request<{}, {}, VerifyPinInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const isValid = await verifyPin(userId, req.body.pin);

    res.status(200).json({
      success: true,
      data: { isValid },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Désactiver le PIN
 * DELETE /api/settings/pin
 */
export const disablePinHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    await disablePin(userId);

    res.status(200).json({
      success: true,
      message: 'PIN désactivé avec succès',
    });
  } catch (error) {
    next(error);
  }
};
