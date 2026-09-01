const path = require('path');

// Charge toujours backend/.env, même si le script est lancé depuis la racine du projet
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🔄 Test de connexion à Supabase...");
    console.log("DATABASE_URL présent:", !!process.env.DATABASE_URL);

    if (process.env.DATABASE_URL) {
      const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
      console.log("DATABASE_URL (masqué):", maskedUrl);

      try {
        const url = new URL(process.env.DATABASE_URL);
        console.log("DB hostname:", url.hostname);
        console.log("DB port:", url.port || 'default');
        console.log("DB protocol:", url.protocol);
      } catch (urlError) {
        console.error("❌ Erreur parsing URL:", urlError.message);
        console.log("DATABASE_URL brute:", process.env.DATABASE_URL);
      }
    }

    await prisma.$queryRaw`SELECT 1`;

    console.log("✅ Connexion Prisma → Supabase réussie !");
  } catch (error) {
    console.error("❌ Erreur Prisma :");
    console.error("Code :", error.code);
    console.error("Message :", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();