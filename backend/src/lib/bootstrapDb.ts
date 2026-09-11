import { prisma } from './prisma';
import { logger } from '../utils/logger';

export const bootstrapDatabase = async (): Promise<void> => {
  try {
    logger.info('🔄 Vérification et synchronisation du schéma de la base de données...');

    // 1. Ajouter les colonnes manquantes à la table User
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "nom" TEXT NOT NULL,
        "prenom" TEXT NOT NULL,
        "numero" TEXT,
        "avatar" TEXT,
        "currency" TEXT NOT NULL DEFAULT 'FCFA',
        "language" TEXT NOT NULL DEFAULT 'Français',
        "timezone" TEXT NOT NULL DEFAULT 'GMT +00:00',
        "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
        "plan" TEXT NOT NULL DEFAULT 'WealthFlow Pro',
        "pinHash" TEXT,
        "isPinEnabled" BOOLEAN NOT NULL DEFAULT false,
        "autoLockMinutes" INTEGER NOT NULL DEFAULT 15,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `);

    // S'assurer que les colonnes existent si la table User existait déjà
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "nom" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "prenom" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "numero" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'FCFA';`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "language" TEXT DEFAULT 'Français';`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'GMT +00:00';`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dateFormat" TEXT DEFAULT 'DD/MM/YYYY';`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" TEXT DEFAULT 'WealthFlow Pro';`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isPinEnabled" BOOLEAN DEFAULT false;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "autoLockMinutes" INTEGER DEFAULT 15;`);

    // 2. Table RefreshToken
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "RefreshToken" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_token_key" ON "RefreshToken"("token");`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`);

    // 3. Table Account
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Account" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'main',
        "initialBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "currency" TEXT NOT NULL DEFAULT 'FCFA',
        "isDefault" BOOLEAN NOT NULL DEFAULT false,
        "icon" TEXT,
        "color" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Account_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // 4. Table Category
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Category" (
        "id" TEXT NOT NULL,
        "userId" TEXT,
        "name" TEXT NOT NULL,
        "icon" TEXT NOT NULL,
        "color" TEXT NOT NULL,
        "budgetLimit" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "type" TEXT NOT NULL,
        "isDefault" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Category_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // 5. Table Transaction
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Transaction" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "accountId" TEXT,
        "categoryId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "type" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "time" TEXT,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);

    // 6. Table SavingsGoal & SavingsDeposit
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SavingsGoal" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "targetAmount" DOUBLE PRECISION NOT NULL,
        "deadline" TEXT NOT NULL,
        "icon" TEXT NOT NULL,
        "color" TEXT NOT NULL,
        "description" TEXT,
        "isAutoSaveActive" BOOLEAN NOT NULL DEFAULT false,
        "autoSaveAmount" DOUBLE PRECISION,
        "checkboxesCount" INTEGER NOT NULL DEFAULT 10,
        "checkedBoxes" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SavingsGoal_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "SavingsGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SavingsDeposit" (
        "id" TEXT NOT NULL,
        "goalId" TEXT NOT NULL,
        "transactionId" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SavingsDeposit_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "SavingsDeposit_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "SavingsGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "SavingsDeposit_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // 7. Table Notification
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Notification" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "read" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // 8. Table Budget & BudgetCategory
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Budget" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "month" TEXT NOT NULL,
        "totalBudget" DOUBLE PRECISION NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Budget_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BudgetCategory" (
        "id" TEXT NOT NULL,
        "budgetId" TEXT NOT NULL,
        "categoryId" TEXT NOT NULL,
        "limit" DOUBLE PRECISION NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "BudgetCategory_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "BudgetCategory_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "BudgetCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    logger.info('✅ Schéma de base de données synchronisé avec succès');

    // 9. Créer les catégories par défaut si elles n'existent pas
    const categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
      logger.info('📂 Initialisation des catégories par défaut...');
      const categories = [
        { name: 'Alimentation', icon: 'Utensils', color: '#FF5330', budgetLimit: 400000, type: 'expense', isDefault: true },
        { name: 'Transport', icon: 'Car', color: '#F97316', budgetLimit: 250000, type: 'expense', isDefault: true },
        { name: 'Logement & Charges', icon: 'Home', color: '#6366F1', budgetLimit: 500000, type: 'expense', isDefault: true },
        { name: 'Divertissement', icon: 'Film', color: '#EC4899', budgetLimit: 150000, type: 'expense', isDefault: true },
        { name: 'Santé & Bien-être', icon: 'HeartPulse', color: '#10B981', budgetLimit: 100000, type: 'expense', isDefault: true },
        { name: 'Épargne & Investissement', icon: 'PiggyBank', color: '#FF5330', budgetLimit: 450000, type: 'expense', isDefault: true },
        { name: 'Shopping & Perso', icon: 'ShoppingBag', color: '#8B5CF6', budgetLimit: 150000, type: 'expense', isDefault: true },
        { name: 'Salaire & Revenus', icon: 'Wallet', color: '#10B981', budgetLimit: 0, type: 'income', isDefault: true },
        { name: 'Freelance & Business', icon: 'Briefcase', color: '#3B82F6', budgetLimit: 0, type: 'income', isDefault: true },
      ];

      for (const cat of categories) {
        await prisma.category.upsert({
          where: { id: `default-${cat.name.toLowerCase().replace(/\s+/g, '-')}` },
          update: cat,
          create: {
            id: `default-${cat.name.toLowerCase().replace(/\s+/g, '-')}`,
            ...cat,
            userId: null,
          },
        });
      }
      logger.info('✅ Catégories par défaut initialisées avec succès');
    }
  } catch (error) {
    logger.error('⚠️ Avertissement lors du bootstrap de la base de données:', error);
  }
};
