import { Request, Response, NextFunction } from 'express';
import { getAllUsers, deleteUser } from '../repositories/user.repository';

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
 * Supprimer un utilisateur par son ID
 * DELETE /api/admin/users/:id
 */
export const deleteAdminUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await deleteUser(id);

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });
  } catch (error) {
    next(error);
  }
};
