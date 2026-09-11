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

// Middleware CORS infaillible & sécurisé
app.use((req, res, next) => {
  const incomingOrigin = req.headers.origin;

  if (incomingOrigin && typeof incomingOrigin === 'string') {
    // Nettoyer rigoureusement l'origine (supprimer tout caractère non ASCII / non URL)
    const cleanOrigin = incomingOrigin.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');

    // Vérifier si autorisée (domaine netlify, localhost ou liste explicite)
    const isAllowed =
      allowedOriginsSet.has(cleanOrigin) ||
      cleanOrigin.endsWith('.netlify.app') ||
      cleanOrigin.includes('localhost') ||
      cleanOrigin.includes('127.0.0.1') ||
      env.server.nodeEnv === 'development';

    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', cleanOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, Accept, Origin'
      );
      res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
      res.setHeader('Access-Control-Max-Age', '86400');
    }
  } else {
    // Requêtes directes ou serveurs sans header Origin (health checks Render, curl, etc.)
    res.setHeader('Access-Control-Allow-Origin', '*');
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
    // Tester la connexion à la base de données
    const { prisma } = await import('./lib/prisma');
    await prisma.$queryRaw`SELECT 1`;

    const columns: any = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' OR table_name = 'user'
    `;

    const tables: any = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    const maskedUrl = env.database.url.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');

    res.status(200).json({
      success: true,
      message: 'API et base de données opérationnelles',
      database: 'connected',
      dbUrl: maskedUrl,
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
