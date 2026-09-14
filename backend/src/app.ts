import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimit';

// Import des routes (à créer)
import apiRoutes from './routes';

const app: Application = express();

// Configuration pour proxy reverse (Render, Fly.io, Heroku)
app.set('trust proxy', 1);

// ============================================================================
// MIDDLEWARE DE SÉCURITÉ
// ============================================================================

// Helmet - Sécurise les headers HTTP tout en autorisant les requêtes cross-origin du frontend
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Liste des origines autorisées normalisées (100% ASCII, sans guillemets, sans slash de fin)
const allowedOriginsSet = new Set(
  env.frontend.allowedUrls
    .map((u) => u.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, ''))
    .filter((u) => /^https?:\/\/[a-zA-Z0-9-._:]+$/.test(u))
);

// Middleware CORS universel & sécurisé (supporte InfinityFree, Netlify, Vercel, localhost, etc.)
app.use((req, res, next) => {
  const incomingOrigin = req.headers.origin;

  if (incomingOrigin && typeof incomingOrigin === 'string') {
    // Nettoyer l'origine (supprimer guillemets, slash de fin, espaces)
    const cleanOrigin = incomingOrigin.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');

    // Renvoyer l'origine appelante pour permettre à tout client Web (InfinityFree, Netlify, localhost, etc.)
    // de communiquer de manière fluide avec les JWT Bearer tokens
    res.setHeader('Access-Control-Allow-Origin', cleanOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Origin'
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
    res.setHeader('Access-Control-Max-Age', '86400');
  } else {
    // Requêtes directes ou serveurs sans header Origin (health checks Render, curl, etc.)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Origin'
    );
  }

  // Répondre immédiatement aux requêtes preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});


// Rate limiting global
app.use(globalLimiter);

// ============================================================================
// MIDDLEWARE DE PARSING
// ============================================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// LOGGING DES REQUÊTES (en développement)
// ============================================================================

if (env.server.nodeEnv === 'development') {
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================================================
// HEALTH CHECK & RACINE
// ============================================================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WealthFlow API v2.0.0 est opérationnelle',
    version: '2.0.0',
    health: '/health',
    api: '/api',
    environment: env.server.nodeEnv,
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WealthFlow API is running',
    timestamp: new Date().toISOString(),
    environment: env.server.nodeEnv,
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const { prisma } = await import('./lib/prisma');
    const { bootstrapDatabase } = await import('./lib/bootstrapDb');

    // Tester la connexion et exécuter la synchronisation
    await prisma.$queryRaw`SELECT 1`;
    const syncResult = await bootstrapDatabase();

    const columns: any = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' OR table_name = 'user'
      ORDER BY ordinal_position ASC
    `;

    const tables: any = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name ASC
    `;

    const maskedUrl = env.database.url.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');

    res.status(200).json({
      success: true,
      message: 'API et base de données opérationnelles',
      version: '2.0.2-pin4',
      database: 'connected',
      dbUrl: maskedUrl,
      sync: syncResult,
      tables: tables.map((t: any) => t.table_name),
      userColumns: columns.map((c: any) => c.column_name),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(503).json({
      success: false,
      message: 'Erreur de connexion à la base de données',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

app.all('/api/sync-schema', async (req, res) => {
  try {
    const { bootstrapDatabase } = await import('./lib/bootstrapDb');
    const syncResult = await bootstrapDatabase();
    res.status(200).json({
      success: true,
      message: 'Synchronisation du schéma terminée',
      syncResult,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la synchronisation',
      error: error.message,
    });
  }
});

// ============================================================================
// ROUTES API
// ============================================================================

app.use('/api', apiRoutes);

// ============================================================================
// GESTION DES ERREURS
// ============================================================================

// Route 404
app.use(notFoundHandler);

// Error handler global
app.use(errorHandler);

// ============================================================================
// EXPORT
// ============================================================================

export default app;
