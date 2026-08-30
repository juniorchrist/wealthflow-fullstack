import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { transactionRoutes } from './transactionRoutes';
import { budgetRoutes } from './budgetRoutes';
import { categoryRoutes } from './categoryRoutes';
import { savingsRoutes } from './savingsRoutes';
import { notificationRoutes } from './notificationRoutes';
import { settingsRoutes } from './settingsRoutes';
import { userRoutes } from './userRoutes';

export const apiRoutes = Router();

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/transactions', transactionRoutes);
apiRoutes.use('/budgets', budgetRoutes);
apiRoutes.use('/categories', categoryRoutes);
apiRoutes.use('/savings-goals', savingsRoutes);
apiRoutes.use('/notifications', notificationRoutes);
apiRoutes.use('/settings', settingsRoutes);
apiRoutes.use('/users', userRoutes);

// Health check endpoint
apiRoutes.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'WealthFlow API',
  });
});
