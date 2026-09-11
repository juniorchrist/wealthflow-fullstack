import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './lib/prisma';

import { bootstrapDatabase } from './lib/bootstrapDb';

const PORT = env.server.port;

let server: any;

// Démarrer le serveur après vérification de la base de données
const startServer = async () => {
  await bootstrapDatabase();

  server = app.listen(PORT, () => {
    logger.info(`🚀 WealthFlow API v2.0.0 démarrée`);
    logger.info(`📡 Serveur en écoute sur le port ${PORT}`);
    logger.info(`🌍 Environnement: ${env.server.nodeEnv}`);
    logger.info(`🔗 URL: http://localhost:${PORT}`);
    logger.info(`💚 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer().catch((error) => {
  logger.error('❌ Échec critique du démarrage du serveur:', error);
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`\n${signal} reçu. Arrêt gracieux du serveur...`);

  server.close(async () => {
    logger.info('✅ Serveur HTTP fermé');

    try {
      await prisma.$disconnect();
      logger.info('✅ Connexion base de données fermée');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Erreur lors de la fermeture de la base de données:', error);
      process.exit(1);
    }
  });

  // Force shutdown après 10 secondes
  setTimeout(() => {
    logger.error('⚠️ Arrêt forcé du serveur (timeout)');
    process.exit(1);
  }, 10000);
};

// Écouter les signaux d'arrêt
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Gérer les erreurs non gérées
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
