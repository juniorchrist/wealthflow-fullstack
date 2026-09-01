import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import { apiRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { prisma } from './config/prisma';

const app = express();

// ─── CORS ──────────────────────────────────────────────────────────────────────
// Config CORS gérant la production Netlify :
//   1. Autorise exactement  https://wealthflow-ui.netlify.app
//   2. Autorise toute Deploy Preview  https://<hash>--wealthflow-ui.netlify.app
//   3. localhost autorisé UNIQUEMENT en développement
//   4. Jamais de "no-cors" : seul le middleware cors Express est utilisé.
//   5. Jamais "*" avec credentials:true : on reflète toujours l'origine exacte.
// Ce middleware est déclaré AVANT app.use('/api', apiRoutes) pour que le
// préflight OPTIONS de POST /api/auth/register reçoive bien les en-têtes CORS.

const PROD_NETLIFY_ORIGIN = config.netlifyProductionOrigin;
const NETLIFY_PREVIEW_RE = config.netlifyPreviewPattern;

// Origines locales, autorisées uniquement si ce n'est pas la production.
const DEV_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
];

function isAllowedOrigin(origin: string): boolean {
  // 1. Domaine de production exact.
  if (origin === PROD_NETLIFY_ORIGIN) {
    return true;
  }

  // 2. Deploy Preview Netlify : "https://<hash>--wealthflow-ui.netlify.app"
  if (NETLIFY_PREVIEW_RE.test(origin)) {
    return true;
  }

  // 3. localhost UNIQUEMENT en développement.
  if (config.nodeEnv !== 'production' && DEV_ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  return false;
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Requêtes sans en-tête Origin (curl, Postman, appels serveur, OPTIONS).
    if (!origin) {
      return callback(null, true);
    }

    if (isAllowedOrigin(origin)) {
      // On renvoie l'origine exacte (jamais "*") pour rester compatible avec
      // credentials: true et produire le bon Access-Control-Allow-Origin.
      return callback(null, origin);
    }

    console.warn(`CORS bloqué pour : ${origin}`);
    return callback(new Error(`Origin non autorisée : ${origin}`));
  },
  // OPTIONS est inclus pour traiter correctement le préflight (requis par
  // POST /api/auth/register en cross-origin).
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: false,
};

// Doit être placé AVANT app.use('/api', apiRoutes).
app.use(cors(corsOptions));
// ─── BODY PARSER ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── ROOT ──────────────────────────────────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'WealthFlow API',
    version: '2.0.0',
    status: 'online',
    environment: config.nodeEnv,
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      transactions: '/api/transactions',
      budgets: '/api/budgets',
      categories: '/api/categories',
      savings: '/api/savings-goals',
      notifications: '/api/notifications',
      settings: '/api/settings',
      users: '/api/users',
    },
  });
});

// ─── API ROUTES ────────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── 404 HANDLER ───────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Ressource introuvable sur l’API WealthFlow.',
  });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── START ─────────────────────────────────────────────────────────────────────
// Render injecte PORT dynamiquement.
const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`[WealthFlow] ✅ Serveur démarré sur le port ${config.port}`);
  console.log(`[WealthFlow] 🌍 Environnement: ${config.nodeEnv}`);

  if (!config.isProduction) {
    console.log(`[WealthFlow] 🔗 URL locale: http://localhost:${config.port}`);
  }
});

// ─── GRACEFUL SHUTDOWN ─────────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  console.log(`[WealthFlow] ${signal} reçu. Fermeture gracieuse...`);

  await prisma.$disconnect();

  server.close(() => {
    console.log('[WealthFlow] Serveur arrêté proprement.');
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;