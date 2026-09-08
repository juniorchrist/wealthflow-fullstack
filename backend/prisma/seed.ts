import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // ==========================================================================
  // CATÉGORIES PAR DÉFAUT (globales, userId = null)
  // ==========================================================================

  const categories = [
    // Catégories de dépenses
    {
      name: 'Alimentation',
      icon: 'Utensils',
      color: '#FF5330',
      budgetLimit: 400000,
      type: 'expense',
      isDefault: true,
    },
    {
      name: 'Transport',
      icon: 'Car',
      color: '#F97316',
      budgetLimit: 250000,
      type: 'expense',
      isDefault: true,
    },
    {
      name: 'Logement & Charges',
      icon: 'Home',
      color: '#6366F1',
      budgetLimit: 500000,
      type: 'expense',
      isDefault: true,
    },
    {
      name: 'Divertissement',
      icon: 'Film',
      color: '#EC4899',
      budgetLimit: 150000,
      type: 'expense',
      isDefault: true,
    },
    {
      name: 'Santé & Bien-être',
      icon: 'HeartPulse',
      color: '#10B981',
      budgetLimit: 100000,
      type: 'expense',
      isDefault: true,
    },
    {
      name: 'Épargne & Investissement',
      icon: 'PiggyBank',
      color: '#FF5330',
      budgetLimit: 450000,
      type: 'expense',
      isDefault: true,
    },
    {
      name: 'Shopping & Perso',
      icon: 'ShoppingBag',
      color: '#8B5CF6',
      budgetLimit: 150000,
      type: 'expense',
      isDefault: true,
    },
    // Catégories de revenus
    {
      name: 'Salaire & Revenus',
      icon: 'Wallet',
      color: '#10B981',
      budgetLimit: 0,
      type: 'income',
      isDefault: true,
    },
    {
      name: 'Freelance & Business',
      icon: 'Briefcase',
      color: '#3B82F6',
      budgetLimit: 0,
      type: 'income',
      isDefault: true,
    },
  ];

  console.log('📂 Création des catégories par défaut...');

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        // On ne peut pas utiliser un where composite, donc on crée ou update par nom
        id: `default-${category.name.toLowerCase().replace(/\s+/g, '-')}`,
      },
      update: category,
      create: {
        id: `default-${category.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...category,
        userId: null, // Catégories globales
      },
    });
  }

  console.log(`✅ ${categories.length} catégories par défaut créées`);

  // ==========================================================================
  // UTILISATEUR DE TEST (OPTIONNEL)
  // ==========================================================================

  // Décommenter pour créer un utilisateur de test
  /*
  const bcrypt = require('bcrypt');
  const testUserEmail = 'test@wealthflow.com';
  
  const existingUser = await prisma.user.findUnique({
    where: { email: testUserEmail },
  });

  if (!existingUser) {
    console.log('👤 Création d\'un utilisateur de test...');
    
    const testUser = await prisma.user.create({
      data: {
        email: testUserEmail,
        passwordHash: await bcrypt.hash('password123', 10),
        firstName: 'Utilisateur',
        lastName: 'Test',
        currency: 'FCFA',
      },
    });

    // Créer un compte par défaut
    await prisma.account.create({
      data: {
        userId: testUser.id,
        name: 'Compte principal',
        type: 'main',
        initialBalance: 1520000,
        isDefault: true,
      },
    });

    console.log(`✅ Utilisateur de test créé: ${testUserEmail} / password123`);
  } else {
    console.log(`ℹ️ Utilisateur de test déjà existant: ${testUserEmail}`);
  }
  */

  console.log('✅ Seed terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
