import { Request, Response } from 'express';
import { z } from 'zod';
import { AccountRepository } from '../repositories/account.repository';

const accountRepository = new AccountRepository();

// Validation schemas
const createAccountSchema = z.object({
  name: z.string().min(1, 'Le nom du compte est requis'),
  type: z.enum(['main', 'card', 'cash', 'savings']).default('main'),
  initialBalance: z.number().default(0),
  currency: z.string().default('FCFA'),
  icon: z.string().optional(),
  color: z.string().optional(),
});

const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['main', 'card', 'cash', 'savings']).optional(),
  initialBalance: z.number().optional(),
  currency: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const getAccountsHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const accounts = await accountRepository.findByUserId(userId);

    res.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des comptes',
    });
  }
};

export const createAccountHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const validatedData = createAccountSchema.parse(req.body);

    // Si c'est le premier compte ou explicitement marqué comme défaut, le marquer comme défaut
    const existingAccounts = await accountRepository.findByUserId(userId);
    const isDefault = existingAccounts.length === 0 || req.body.isDefault === true;

    const account = await accountRepository.create({
      userId,
      ...validatedData,
      isDefault,
    });

    res.status(201).json({
      success: true,
      data: account,
      message: 'Compte créé avec succès',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.flatten().fieldErrors,
      });
      return;
    }

    console.error('Error creating account:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte',
    });
  }
};

export const updateAccountHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const accountId = req.params.id;
    const validatedData = updateAccountSchema.parse(req.body);

    // Vérifier que le compte appartient à l'utilisateur
    const existingAccount = await accountRepository.findById(accountId);
    if (!existingAccount || existingAccount.userId !== userId) {
      res.status(404).json({
        success: false,
        message: 'Compte non trouvé',
      });
      return;
    }

    const account = await accountRepository.update(accountId, validatedData);

    res.json({
      success: true,
      data: account,
      message: 'Compte mis à jour avec succès',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.flatten().fieldErrors,
      });
      return;
    }

    console.error('Error updating account:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du compte',
    });
  }
};

export const deleteAccountHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const accountId = req.params.id;

    // Vérifier que le compte appartient à l'utilisateur
    const existingAccount = await accountRepository.findById(accountId);
    if (!existingAccount || existingAccount.userId !== userId) {
      res.status(404).json({
        success: false,
        message: 'Compte non trouvé',
      });
      return;
    }

    // Empêcher la suppression du compte par défaut s'il y a d'autres comptes
    const userAccounts = await accountRepository.findByUserId(userId);
    if (existingAccount.isDefault && userAccounts.length > 1) {
      res.status(400).json({
        success: false,
        message: 'Impossible de supprimer le compte par défaut. Définissez d\'abord un autre compte par défaut.',
      });
      return;
    }

    await accountRepository.delete(accountId);

    res.json({
      success: true,
      message: 'Compte supprimé avec succès',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du compte',
    });
  }
};

export const setDefaultAccountHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const accountId = req.params.id;

    // Vérifier que le compte appartient à l'utilisateur
    const existingAccount = await accountRepository.findById(accountId);
    if (!existingAccount || existingAccount.userId !== userId) {
      res.status(404).json({
        success: false,
        message: 'Compte non trouvé',
      });
      return;
    }

    await accountRepository.setDefault(userId, accountId);

    res.json({
      success: true,
      message: 'Compte défini comme défaut avec succès',
    });
  } catch (error) {
    console.error('Error setting default account:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la définition du compte par défaut',
    });
  }
};