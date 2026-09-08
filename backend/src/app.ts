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

// Helmet - Sécurise les headers HTTP
app.use(helmet());

// CORS - Autorise uniquement le frontend
app.use(
  cors({
    origin: env.frontend.url,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

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
// HEALTH CHECK
// ============================================================================

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

    res.status(200).json({
      success: true,
      message: 'API et base de données opérationnelles',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Erreur de connexion à la base de données',
      database: 'disconnected',
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
