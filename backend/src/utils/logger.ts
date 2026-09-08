import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Format personnalisé
const customFormat = printf(({ level, message, timestamp, stack }) => {
  if (stack) {
    return `${timestamp} [${level}]: ${message}\n${stack}`;
  }
  return `${timestamp} [${level}]: ${message}`;
});

// Créer le logger
export const logger = winston.createLogger({
  level: env.server.nodeEnv === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    // Console
    new winston.transports.Console({
      format: combine(
        colorize(),
        customFormat
      ),
    }),
    // Fichier d'erreurs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // Fichier combiné
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Ne pas logger les mots de passe, tokens, etc.
export const sanitizeForLog = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveFields = ['password', 'passwordHash', 'token', 'refreshToken', 'pinCode', 'pinHash', 'secret'];
  const sanitized = { ...data };

  for (const key in sanitized) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeForLog(sanitized[key]);
    }
  }

  return sanitized;
};
