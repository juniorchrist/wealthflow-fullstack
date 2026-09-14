import { Router } from 'express';
import authRoutes from './auth.routes';
import categoriesRoutes from './categories.routes';
import transactionsRoutes from './transactions.routes';
import dashboardRoutes from './dashboard.routes';
import savingsRoutes from './savings.routes';
import budgetsRoutes from './budgets.routes';
import notificationsRoutes from './notifications.routes';
import settingsRoutes from './settings.routes';
import analyticsRoutes from './analytics.routes';
import adminRoutes from './admin.routes';

const router = Router();

// ============================================================================
// ROUTES
// ============================================================================

// Route de test temporaire
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WealthFlow API v2.0.0',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      transactions: '/api/transactions',
      categories: '/api/categories',
      savings: '/api/savings-goals',
      dashboard: '/api/dashboard',
      budgets: '/api/budgets',
      notifications: '/api/notifications',
      settings: '/api/settings',
      analytics: '/api/analytics',
    },
  });
});

// Authentication
router.use('/auth', authRoutes);

// Categories
router.use('/categories', categoriesRoutes);

// Transactions
router.use('/transactions', transactionsRoutes);

// Dashboard
router.use('/dashboard', dashboardRoutes);

// Savings Goals
router.use('/savings-goals', savingsRoutes);

// Budgets
router.use('/budgets', budgetsRoutes);

// Notifications
router.use('/notifications', notificationsRoutes);

// Settings
router.use('/settings', settingsRoutes);

// Analytics
router.use('/analytics', analyticsRoutes);

// Admin
router.use('/admin', adminRoutes);

export default router;
