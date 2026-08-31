import dotenv from 'dotenv';
import path from 'path';

// En dev local, charger le fichier .env du dossier backend/
// En production (Render), les variables sont directement dans l'environnement
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback pour .env à la racine du cwd

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`[WealthFlow] Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: requireEnv('JWT_SECRET', 'wealthflow_fallback_dev_secret_key_2026'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigins: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  isProduction: process.env.NODE_ENV === 'production',
};
