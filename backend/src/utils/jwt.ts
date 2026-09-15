import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
}

/**
 * Générer un access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  } as jwt.SignOptions);
};

/**
 * Générer un refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
};

/**
 * Vérifier un access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.jwt.secret) as TokenPayload;
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
};

/**
 * Vérifier un refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.jwt.refreshSecret) as TokenPayload;
  } catch (error) {
    throw new Error('Refresh token invalide ou expiré');
  }
};

/**
 * Décoder un token sans vérification (pour debug)
 */
export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};
