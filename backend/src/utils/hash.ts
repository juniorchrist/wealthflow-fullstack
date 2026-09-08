import bcrypt from 'bcrypt';
import { env } from '../config/env';

/**
 * Hasher un mot de passe ou un PIN
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, env.security.bcryptRounds);
};

/**
 * Comparer un mot de passe en clair avec son hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Hasher un PIN (4 chiffres)
 */
export const hashPin = async (pin: string): Promise<string> => {
  // Même fonction que hashPassword, mais séparée pour la clarté
  return hashPassword(pin);
};

/**
 * Comparer un PIN avec son hash
 */
export const comparePin = async (pin: string, hash: string): Promise<boolean> => {
  return comparePassword(pin, hash);
};
