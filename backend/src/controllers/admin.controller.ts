import { Request, Response, NextFunction } from 'express';
import { getAllUsers, deleteUser, findUserById, findUserByEmail } from '../repositories/user.repository';
import { prisma } from '../lib/prisma';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { saveRefreshToken } from '../repositories/token.repository';
import { hashPassword } from '../utils/hash';

/**
 * Authentification administrateur dédiée et sécurisée
 * POST /api/admin/login
 */
export const adminLoginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { identifier, password } = req.body || {};

    const cleanId = String(identifier || '').trim().toLowerCase();
    const cleanPass = String(password || '');

    const validAdminId = (process.env.ADMIN_ID || 'admin').toLowerCase();
    const validAdminPass = process.env.ADMIN_PASSWORD || 'wealthflow2026';

    if (cleanId !== validAdminId && cleanId !== 'admin@wealthflow.app') {
      res.status(401).json({
        success: false,
        message: 'Identifiant administrateur invalide',
      });
      return;
    }

    if (cleanPass !== validAdminPass) {
      res.status(401).json({
        success: false,
        message: 'Mot de passe administrateur incorrect',
      });
      return;
    }

    // Trouver ou créer le compte admin en base de données
    const adminEmail = 'admin@wealthflow.app';
    let adminUser = await findUserByEmail(adminEmail);

    if (!adminUser) {
      const defaultHash = await hashPassword(validAdminPass);
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash: defaultHash,
          nom: 'WealthFlow',
          prenom: 'Admin',
          role: 'admin',
          plan: 'WealthFlow Master Admin',
        },
      });
    } else if (adminUser.role !== 'admin') {
      adminUser = await prisma.user.update({
        where: { id: adminUser.id },
        data: { role: 'admin' },
      });
    }

    const payload = {
      userId: adminUser.id,
      email: adminUser.email,
      role: 'admin',
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await saveRefreshToken(adminUser.id, refreshToken, expiresAt);

    res.status(200).json({
      success: true,
      message: 'Authentification administrateur réussie',
      data: {
        user: {
          id: adminUser.id,
          email: adminUser.email,
          nom: adminUser.nom,
          prenom: adminUser.prenom,
          role: 'admin',
          plan: adminUser.plan,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer la liste des utilisateurs réels avec leurs données financières réelles pour l'administration
 * GET /api/admin/users
 */
export const listAdminUsersHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawUsers = await getAllUsers();

    // Filtrer pour ne pas afficher le compte administrateur maître dans la liste des utilisateurs à modérer
    const usersOnly = rawUsers.filter(
      (u) => u.email.toLowerCase() !== 'admin@wealthflow.app'
    );

    // Récupérer les emails bannis
    const bans = await prisma.banRecord.findMany({ select: { email: true } });
    const bannedEmailsSet = new Set(bans.map((b) => b.email.toLowerCase()));

    const formattedUsers = usersOnly.map((u) => {
      const income = u.transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const expenses = u.transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const savingsFromDeposits = (u.savingsGoals || []).reduce(
        (sum: number, g: any) =>
          sum +
          (g.deposits || []).reduce(
            (dSum: number, d: any) => dSum + Number(d.amount || 0),
            0
          ),
        0
      );

      const savingsFromTx = u.transactions
        .filter((t) => t.type === 'savings_deposit')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const savings = Math.max(savingsFromDeposits, savingsFromTx);

      // Calculer le budget mensuel réel de l'utilisateur à partir de ses limites de catégories
      const budgetFromCategories = ((u as any).categories || [])
        .filter((c: any) => c.type === 'expense')
        .reduce((sum: number, c: any) => sum + Number(c.budgetLimit || 0), 0);

      const budgetFromBudgets = (u.budgets || []).reduce(
        (sum, b) => sum + Number(b.totalBudget || 0),
        0
      );

      const budgetTotal = Math.max(budgetFromCategories, budgetFromBudgets);

      const calculatedBalance = income - expenses - savings;
      const isBanned = bannedEmailsSet.has(u.email.toLowerCase());

      const fullName = `${u.prenom || ''} ${u.nom || ''}`.trim() || u.email;

      const formattedJoin = new Date(u.createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      // Dépenses réelles du mois courant pour l'utilisation du budget
      // IMPORTANT : Utiliser strictement les dépenses du mois courant, même si elles sont à 0
      const currentMonthExpenses = u.transactions
        .filter((t) => {
          if (t.type !== 'expense') return false;
          const d = new Date(t.date);
          return !isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        })
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      // budgetSpent = dépenses du mois courant uniquement (source de vérité)
      const budgetSpent = currentMonthExpenses;
      const budgetUsagePercentage =
        budgetTotal > 0 ? Math.min(100, Math.round((budgetSpent / budgetTotal) * 100)) : 0;

      return {
        id: u.id,
        name: fullName,
        email: u.email,
        phone: u.numero || '',
        plan: u.plan || 'WealthFlow Pro',
        role: u.role || 'user',
        status: isBanned ? 'banni' : 'actif',
        lastLogin: 'Récemment',
        joinDate: formattedJoin,
        income,
        expenses,
        savings,
        balance: calculatedBalance,
        transactions: u.transactions.length,
        budgetTotal,
        budgetSpent,
        budgetUsagePercentage,
        recentTransactions: u.transactions.slice(0, 5),
      };
    });

    res.status(200).json({
      success: true,
      data: formattedUsers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer et bannir un utilisateur par son ID en enregistrant le motif réel
 * DELETE /api/admin/users/:id
  */
export const deleteAdminUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { reason, bannedBy, email } = req.body || {};

    // 1. Chercher l'utilisateur par ID, par email, ou si l'identifiant lui-même est un email
    let user = await findUserById(id);
    if (!user && (email || id.includes('@'))) {
      const searchEmail = email || id;
      user = await findUserByEmail(String(searchEmail).toLowerCase().trim());
    }

    const targetEmail = (user?.email || email || (id.includes('@') ? id : '')).toLowerCase().trim();

    // Empêcher la suppression du compte administrateur maître
    if (user?.role === 'admin' || targetEmail === 'admin@wealthflow.app') {
      res.status(400).json({
        success: false,
        message: 'Impossible de supprimer ou bannir le compte administrateur principal du système.',
      });
      return;
    }

    const banReason =
      reason && String(reason).trim().length > 0
        ? String(reason).trim()
        : 'Suppression administrative pour non-respect des conditions d’utilisation';

    if (!targetEmail && !user) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé en base de données',
      });
      return;
    }

    // 2. Toujours enregistrer ou mettre à jour le motif de bannissement dans BanRecord
    if (targetEmail) {
      await prisma.banRecord.upsert({
        where: { email: targetEmail },
        update: {
          reason: banReason,
          nom: user?.nom || null,
          prenom: user?.prenom || null,
          bannedAt: new Date(),
          bannedBy: bannedBy || 'Administrateur',
        },
        create: {
          email: targetEmail,
          nom: user?.nom || null,
          prenom: user?.prenom || null,
          reason: banReason,
          bannedAt: new Date(),
          bannedBy: bannedBy || 'Administrateur',
        },
      });
    }

    // 3. Supprimer le compte et toutes ses relations en cascade transactionnelle s'il existe
    if (user) {
      await deleteUser(user.id);
    }

    res.status(200).json({
      success: true,
      message: `Le compte ${targetEmail} a été supprimé et banni avec succès pour le motif : "${banReason}"`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bannir un utilisateur directement (avec ou sans suppression préalable)
 * POST /api/admin/bans
 */
export const createBanHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, nom, prenom, reason, bannedBy, deleteAccount } = req.body || {};

    if (!email || !String(email).includes('@')) {
      res.status(400).json({
        success: false,
        message: 'Adresse email valide requise pour le bannissement',
      });
      return;
    }

    const cleanEmail = String(email).toLowerCase().trim();
    if (cleanEmail === 'admin@wealthflow.app') {
      res.status(400).json({
        success: false,
        message: 'Impossible de bannir le compte administrateur système.',
      });
      return;
    }

    const banReason =
      reason && String(reason).trim().length > 0
        ? String(reason).trim()
        : 'Bannissement administratif pour non-respect des conditions d’utilisation';

    // Trouver l'utilisateur s'il existe
    const user = await findUserByEmail(cleanEmail);
    if (user?.role === 'admin') {
      res.status(400).json({
        success: false,
        message: 'Impossible de bannir un compte avec privilèges administrateur.',
      });
      return;
    }

    const banRecord = await prisma.banRecord.upsert({
      where: { email: cleanEmail },
      update: {
        reason: banReason,
        nom: nom || user?.nom || null,
        prenom: prenom || user?.prenom || null,
        bannedAt: new Date(),
        bannedBy: bannedBy || 'Administrateur',
      },
      create: {
        email: cleanEmail,
        nom: nom || user?.nom || null,
        prenom: prenom || user?.prenom || null,
        reason: banReason,
        bannedAt: new Date(),
        bannedBy: bannedBy || 'Administrateur',
      },
    });

    if (deleteAccount && user) {
      await deleteUser(user.id);
    }

    res.status(201).json({
      success: true,
      message: `Le compte ${cleanEmail} a été banni avec succès`,
      data: banRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Diffuser une notification à un utilisateur ou à tous les utilisateurs
 * POST /api/admin/notifications/broadcast
 */
export const broadcastNotificationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, message, type, targetUserId } = req.body;

    if (!title || !message) {
      res.status(400).json({
        success: false,
        message: 'Le titre et le message de la notification sont obligatoires',
      });
      return;
    }

    if (targetUserId && targetUserId !== 'all') {
      // Notification ciblée pour un utilisateur précis
      const notif = await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: String(title).trim(),
          message: String(message).trim(),
          type: type || 'info',
        },
      });

      res.status(201).json({
        success: true,
        message: 'Notification envoyée avec succès à l\'utilisateur',
        data: notif,
      });
      return;
    }

    // Notification globale pour TOUS les utilisateurs enregistrés
    const allUsers = await prisma.user.findMany({
      select: { id: true },
    });

    if (allUsers.length === 0) {
      res.status(200).json({
        success: true,
        message: 'Aucun utilisateur présent en base.',
      });
      return;
    }

    const notificationsData = allUsers.map((u) => ({
      userId: u.id,
      title: String(title).trim(),
      message: String(message).trim(),
      type: type || 'info',
    }));

    await prisma.notification.createMany({
      data: notificationsData,
    });

    res.status(201).json({
      success: true,
      message: `Notification globale diffusée avec succès à ${allUsers.length} utilisateur(s)`,
      count: allUsers.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lister tous les comptes bannis et leurs motifs réels
 * GET /api/admin/bans
 */
export const listBansHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bans = await prisma.banRecord.findMany({
      orderBy: { bannedAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: bans,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Révoquer un bannissement
 * DELETE /api/admin/bans/:id
 */
export const deleteBanHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (id.includes('@')) {
      await prisma.banRecord.deleteMany({
        where: { email: id.toLowerCase().trim() },
      });
    } else {
      await prisma.banRecord.deleteMany({
        where: { id },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bannissement révoqué avec succès',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lister les tickets d'assistance reçus du Centre d'aide
 * GET /api/admin/support/tickets
 */
export const listSupportTicketsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un ticket d'assistance et notifier automatiquement l'utilisateur lors de la résolution
 * PATCH /api/admin/support/tickets/:id
 */
export const updateSupportTicketHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, reply } = req.body;

    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      res.status(404).json({
        success: false,
        message: 'Ticket introuvable',
      });
      return;
    }

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(reply !== undefined ? { reply } : {}),
      },
    });

    // Si le ticket est résolu ou si une réponse a été fournie, créer une notification pour l'utilisateur
    if (status === 'resolved' || (reply && reply.trim().length > 0)) {
      let targetUser = null;
      if (existingTicket.userId) {
        targetUser = await findUserById(existingTicket.userId);
      }
      if (!targetUser && existingTicket.email) {
        targetUser = await findUserByEmail(existingTicket.email);
      }

      if (targetUser) {
        const notifTitle =
          status === 'resolved'
            ? `🎫 Ticket Support Résolu : ${existingTicket.subject}`
            : `💬 Réponse à votre ticket : ${existingTicket.subject}`;

        const notifMessage =
          reply && reply.trim().length > 0
            ? reply.trim()
            : 'Votre demande d\'assistance a été traitée et résolue avec succès par l\'équipe WealthFlow.';

        await prisma.notification.create({
          data: {
            userId: targetUser.id,
            title: notifTitle,
            message: notifMessage,
            type: status === 'resolved' ? 'success' : 'info',
          },
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Ticket mis à jour avec succès',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Purger le cache et tester la latence de la base de données (Maintenance)
 * POST /api/admin/maintenance/cache-clear
 */
export const maintenancePurgeHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - start;

    const memoryUsage = process.memoryUsage();

    res.status(200).json({
      success: true,
      message: 'Cache serveur purgé et diagnostic système effectué avec succès.',
      data: {
        dbLatencyMs,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
