import express from 'express';
import cors from 'cors';
import { config } from './config';
import { apiRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { prisma } from './config/prisma';

const app = express();

// CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (
        config.corsOrigins.includes(origin) ||
        config.corsOrigins.includes('*') ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint info
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Serveur API WealthFlow en ligne et opérationnel !',
    version: '2.0',
    documentation: {
      health: '/api/health',
      auth: '/api/auth',
      transactions: '/api/transactions',
      budgets: '/api/budgets',
      categories: '/api/categories',
      savings: '/api/savings-goals',
      notifications: '/api/notifications',
    },
    note: "Pour accéder à l'application web WealthFlow, ouvrez http://localhost:3000 dans votre navigateur.",
  });
});

// API Root
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`[WealthFlow Backend] Server running on http://localhost:${config.port}`);
  console.log(`[WealthFlow Backend] Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[WealthFlow Backend] SIGTERM received. Closing gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
});

export default app;
