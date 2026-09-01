import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

function requireEnv(key: string, fallback?: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const value = process.env[key] || (isProduction ? undefined : fallback);

  if (!value) {
    throw new Error(
      `[WealthFlow] Missing required environment variable: ${key}`
    );
  }

  return value;
}

interface AppConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigins: string[];
  isProduction: boolean;
}

const DEFAULT_CORS_ORIGINS = [
  'https://wealthflow-ui.netlify.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
];

function resolveCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) return DEFAULT_CORS_ORIGINS;

  const parsed = raw
    .split(',')
    .map((o: string) => o.trim())
    .filter(Boolean);

  // Filet de sécurité : si CORS_ORIGIN est défini mais vide/mal formé
  // (ex: "" ou ","), on retombe sur les valeurs par défaut au lieu de
  // bloquer TOUTES les origines (ce qui casserait le site en silence).
  return parsed.length > 0 ? parsed : DEFAULT_CORS_ORIGINS;
}

export const config: AppConfig = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,

  nodeEnv: process.env.NODE_ENV || 'development',

  jwtSecret: requireEnv(
    'JWT_SECRET',
    'wealthflow_fallback_dev_secret_key_2026'
  ),

  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  corsOrigins: resolveCorsOrigins(),

  isProduction: process.env.NODE_ENV === 'production',
};