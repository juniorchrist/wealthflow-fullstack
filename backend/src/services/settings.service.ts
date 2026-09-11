import {
  getUserById,
  updateUserSettings as updateUserSettingsRepo,
  setupUserPin,
  verifyUserPin,
  disableUserPin,
} from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/hash';
import { AppError } from '../middleware/errorHandler';
import { UpdateSettingsInput } from '../validators/settings.validator';

/**
 * Récupérer les paramètres utilisateur
 */
export const getUserSettings = async (userId: string) => {
  const user = await getUserById(userId);

  if (!user) {
    throw new AppError(404, 'Utilisateur non trouvé', 'USER_NOT_FOUND');
  }

  return {
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    numero: user.numero,
    avatar: user.avatar,
    currency: user.currency,
    language: user.language,
    timezone: user.timezone,
    dateFormat: user.dateFormat,
    plan: user.plan,
    isPinEnabled: user.isPinEnabled,
    autoLockMinutes: user.autoLockMinutes,
  };
};

/**
 * Mettre à jour les paramètres utilisateur
 */
export const updateUserSettings = async (userId: string, data: UpdateSettingsInput) => {
  const updatedUser = await updateUserSettingsRepo(userId, data);
  
  return {
    nom: updatedUser.nom,
    prenom: updatedUser.prenom,
    email: updatedUser.email,
    numero: updatedUser.numero,
    avatar: updatedUser.avatar,
    currency: updatedUser.currency,
    language: updatedUser.language,
    timezone: updatedUser.timezone,
    dateFormat: updatedUser.dateFormat,
    plan: updatedUser.plan,
    isPinEnabled: updatedUser.isPinEnabled,
    autoLockMinutes: updatedUser.autoLockMinutes,
  };
};

/**
 * Configurer le PIN
 */
export const setupPin = async (userId: string, pin: string) => {
  // Valider le format du PIN (4-6 chiffres)
  if (!/^\d{4,6}$/.test(pin)) {
    throw new AppError(400, 'Le PIN doit contenir 4 à 6 chiffres', 'INVALID_PIN_FORMAT');
  }

  // Hasher le PIN
  const pinHash = await hashPassword(pin);
  await setupUserPin(userId, pinHash);
};

/**
 * Vérifier le PIN
 */
export const verifyPin = async (userId: string, pin: string) => {
  const user = await getUserById(userId);

  if (!user || !user.isPinEnabled || !user.pinHash) {
    return false;
  }

  // Comparer avec bcrypt
  return comparePassword(pin, user.pinHash);
};

/**
 * Désactiver le PIN
 */
export const disablePin = async (userId: string) => {
  await disableUserPin(userId);
};
