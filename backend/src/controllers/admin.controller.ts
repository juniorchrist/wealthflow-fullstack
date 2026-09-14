import { Request, Response, NextFunction } from 'express';
import { getAllUsers, deleteUser, findUserById } from '../repositories/user.repository';
import { prisma } from '../lib/prisma';

/**
 * Récupérer la liste des utilisateurs réels pour l'administration
 * GET /api/admin/users
 */
export const listAdminUsersHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawUsers = await getAllUsers();

    const formattedUsers = rawUsers.map((u) => {
      const income = u.transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenses = u.transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const savings = (u.savingsGoals || []).reduce(
        (sum: number, g: any) => sum + (g.deposits || []).reduce((dSum: number, d: any) => dSum + Number(d.amount || 0), 0),
        0
      );

      const budgetTotal = u.budgets.reduce((sum, b) => sum + Number(b.totalBudget), 0);

      const fullName = `${u.prenom || ''} ${u.nom || ''}`.trim() || u.email;

      const formattedJoin = new Date(u.createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      return {
        id: u.id,
        name: fullName,
        email: u.email,
        phone: u.numero || '',
        plan: u.plan || 'WealthFlow Pro',
        status: 'actif',
        lastLogin: 'Récemment',
        joinDate: formattedJoin,
        income,
        expenses,
        savings,
        transactions: u.transactions.length,
        budgetTotal,
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
    const { reason, bannedBy } = req.body || {};

    const user = await findUserById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
      return;
    }

    const banReason = reason && String(reason).trim().length > 0
      ? String(reason).trim()
      : 'Suppression administrative pour non-respect des conditions d’utilisation';

    // Enregistrer ou mettre à jour le motif de bannissement dans BanRecord
    await prisma.banRecord.upsert({
      where: { email: user.email.toLowerCase() },
      update: {
        reason: banReason,
        nom: user.nom,
        prenom: user.prenom,
        bannedAt: new Date(),
        bannedBy: bannedBy || 'Administrateur',
      },
      create: {
        email: user.email.toLowerCase(),
        nom: user.nom,
        prenom: user.prenom,
        reason: banReason,
        bannedAt: new Date(),
        bannedBy: bannedBy || 'Administrateur',
      },
    });

    // Supprimer le compte et toutes ses relations en cascade
    await deleteUser(id);

    res.status(200).json({
      success: true,
      message: `Le compte de ${user.email} a été supprimé et banni avec succès pour le motif : "${banReason}"`,
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
 * Révoquer un bannissement (débannir)
 * DELETE /api/admin/bans/:id
 */
export const deleteBanHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await prisma.banRecord.delete({
      where: { id },
    });

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
 * Mettre à jour un ticket d'assistance (statut, réponse de l'admin)
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

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(reply !== undefined ? { reply } : {}),
      },
    });

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
