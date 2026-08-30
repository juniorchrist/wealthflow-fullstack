import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database seeding for development...');

  const passwordHash = await bcrypt.hash('1234', 10);
  const pinHash = await bcrypt.hash('1234', 10);

  // 1. Create Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@wealthflow.ci' },
    update: {},
    create: {
      nom: 'Diploh',
      prenom: 'Junior',
      numero: '+225 07 00 00 00',
      email: 'demo@wealthflow.ci',
      passwordHash,
      pinHash,
      settings: {
        create: {
          theme: 'light',
          currency: 'FCFA',
          securityLockEnabled: true,
        },
      },
    },
  });

  console.log(`[Seed] Demo user ready: ${demoUser.email} (Password: 1234)`);

  // 2. Default Categories
  const categories = [
    { id: `cat-alimentation-${demoUser.id.substring(0, 8)}`, name: 'Alimentation & Courses', color: '#10B981', icon: 'Utensils', type: 'expense' },
    { id: `cat-transport-${demoUser.id.substring(0, 8)}`, name: 'Transport & Carburant', color: '#3B82F6', icon: 'Car', type: 'expense' },
    { id: `cat-logement-${demoUser.id.substring(0, 8)}`, name: 'Logement & Loyer', color: '#8B5CF6', icon: 'Home', type: 'expense' },
    { id: `cat-factures-${demoUser.id.substring(0, 8)}`, name: 'Factures (CIE / SODECI / Internet)', color: '#F59E0B', icon: 'Zap', type: 'expense' },
    { id: `cat-sante-${demoUser.id.substring(0, 8)}`, name: 'Santé & Pharmacie', color: '#EF4444', icon: 'HeartPulse', type: 'expense' },
    { id: `cat-loisirs-${demoUser.id.substring(0, 8)}`, name: 'Loisirs, Sorties & Détente', color: '#EC4899', icon: 'Sparkles', type: 'expense' },
    { id: `cat-shopping-${demoUser.id.substring(0, 8)}`, name: 'Shopping & Habillement', color: '#6366F1', icon: 'ShoppingBag', type: 'expense' },
    { id: `cat-education-${demoUser.id.substring(0, 8)}`, name: 'Éducation & Formation', color: '#14B8A6', icon: 'GraduationCap', type: 'expense' },
    { id: `cat-salaire-${demoUser.id.substring(0, 8)}`, name: 'Salaire & Revenus Pro', color: '#059669', icon: 'Briefcase', type: 'income' },
    { id: `cat-business-${demoUser.id.substring(0, 8)}`, name: 'Ventes & Freelance', color: '#0284C7', icon: 'TrendingUp', type: 'income' },
    { id: `cat-epargne-transfert-${demoUser.id.substring(0, 8)}`, name: 'Épargne & Investissement', color: '#D97706', icon: 'PiggyBank', type: 'both' },
    { id: `cat-autres-${demoUser.id.substring(0, 8)}`, name: 'Autres & Imprévus', color: '#64748B', icon: 'HelpCircle', type: 'both' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id,
        userId: demoUser.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        type: cat.type,
        isDefault: true,
      },
    });
  }

  // 3. Current month budget
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  await prisma.budget.upsert({
    where: {
      userId_month: {
        userId: demoUser.id,
        month: currentMonth,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      month: currentMonth,
      totalBudget: 250000,
      savingsTarget: 50000,
      categoryBudgets: {},
    },
  });

  // 4. Sample Transactions
  const catAlim = categories[0].id;
  const catTransport = categories[1].id;
  const catSalary = categories[8].id;

  const countTx = await prisma.transaction.count({ where: { userId: demoUser.id } });
  if (countTx === 0) {
    await prisma.transaction.createMany({
      data: [
        {
          userId: demoUser.id,
          amount: 500000,
          type: 'income',
          categoryId: catSalary,
          date: `${currentMonth}-01`,
          note: 'Salaire mensuel',
        },
        {
          userId: demoUser.id,
          amount: 45000,
          type: 'expense',
          categoryId: catAlim,
          date: `${currentMonth}-03`,
          note: 'Courses supermarché',
        },
        {
          userId: demoUser.id,
          amount: 15000,
          type: 'expense',
          categoryId: catTransport,
          date: `${currentMonth}-05`,
          note: 'Carburant',
        },
      ],
    });
  }

  // 5. Sample Savings Goal
  const countGoal = await prisma.savingsGoal.count({ where: { userId: demoUser.id } });
  if (countGoal === 0) {
    await prisma.savingsGoal.create({
      data: {
        userId: demoUser.id,
        month: currentMonth,
        title: 'Fonds d’urgence',
        targetAmount: 300000,
        currentAmount: 100000,
        category: categories[10].id,
        milestones: {
          create: [
            { title: 'Étape 1', targetAmount: 100000, isCompleted: true, completedAt: `${currentMonth}-02` },
            { title: 'Étape 2', targetAmount: 100000, isCompleted: false },
            { title: 'Étape 3', targetAmount: 100000, isCompleted: false },
          ],
        },
      },
    });
  }

  console.log('[Seed] Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
