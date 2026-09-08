import { z } from 'zod';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Schéma de validation des variables d'environnement
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL est requis'),
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caractères'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET doit faire au moins 32 caractères'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().url('FRONTEND_URL doit être une URL valide'),
  BCRYPT_ROUNDS: z.string().default('10'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
});

// Valider les variables d'environnement
const envValidation = envSchema.safeParse(process.env);

if (!envValidation.success) {
  console.error('❌ Erreur de validation des variables d\'environnement :');
  console.error(envValidation.error.format());
  process.exit(1);
}

export const env = {
  database: {
    url: envValidation.data.DATABASE_URL,
  },
  server: {
    port: parseInt(envValidation.data.PORT, 10),
    nodeEnv: envValidation.data.NODE_ENV,
  },
  jwt: {
    secret: envValidation.data.JWT_SECRET,
    refreshSecret: envValidation.data.JWT_REFRESH_SECRET,
    expiresIn: envValidation.data.JWT_EXPIRES_IN,
    refreshExpiresIn: envValidation.data.JWT_REFRESH_EXPIRES_IN,
  },
  frontend: {
    url: envValidation.data.FRONTEND_URL,
  },
  security: {
    bcryptRounds: parseInt(envValidation.data.BCRYPT_ROUNDS, 10),
  },
  rateLimit: {
    windowMs: parseInt(envValidation.data.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(envValidation.data.RATE_LIMIT_MAX_REQUESTS, 10),
  },
};
