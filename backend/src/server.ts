import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import { apiRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { prisma } from './config/prisma';

const app = express();

// ─── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin) {
        return callback(null, true);
      }

      const allowed =
        config.corsOrigins.includes(origin) ||
        config.corsOrigins.includes('*') ||
        (!config.isProduction &&
          (origin.startsWith('http://localhost') ||
            origin.startsWith('http://127.0.0.1')));

      if (allowed) {
        return callback(null, true);
      }

      return callback(new Error(`CORS: Origin non autorisée → ${origin}`));
    },
    credentials: true,
  })
);

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