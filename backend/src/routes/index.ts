
import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { transactionRoutes } from './transactionRoutes';
import { budgetRoutes } from './budgetRoutes';
import { categoryRoutes } from './categoryRoutes';
import { savingsRoutes } from './savingsRoutes';
import { notificationRoutes } from './notificationRoutes';
import { settingsRoutes } from './settingsRoutes';
import { userRoutes } from './userRoutes';
import { prisma } from '../config/prisma';

export const apiRoutes = Router();

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/transactions', transactionRoutes);
apiRoutes.use('/budgets', budgetRoutes);
apiRoutes.use('/categories', categoryRoutes);
apiRoutes.use('/savings-goals', savingsRoutes);
apiRoutes.use('/notifications', notificationRoutes);
apiRoutes.use('/settings', settingsRoutes);
apiRoutes.use('/users', userRoutes);

// ─── Health check (sondé par Render pour keep-alive) ──────────────────────────
apiRoutes.get('/health', async (_req, res) => {
  let dbStatus = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'error';
  }

  const status = dbStatus === 'ok' ? 200 : 503;
  res.status(status).json({
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    service: 'WealthFlow API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: Math.floor(process.uptime()),
  });
});

