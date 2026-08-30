import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updatePinSchema,
} from '../validators/authValidator';

const DEFAULT_CATEGORIES_DATA = [
  { id: 'cat-alimentation', name: 'Alimentation & Courses', color: '#10B981', icon: 'Utensils', type: 'expense' },
  { id: 'cat-transport', name: 'Transport & Carburant', color: '#3B82F6', icon: 'Car', type: 'expense' },
  { id: 'cat-logement', name: 'Logement & Loyer', color: '#8B5CF6', icon: 'Home', type: 'expense' },
  { id: 'cat-factures', name: 'Factures (CIE / SODECI / Internet)', color: '#F59E0B', icon: 'Zap', type: 'expense' },
  { id: 'cat-sante', name: 'Santé & Pharmacie', color: '#EF4444', icon: 'HeartPulse', type: 'expense' },
  { id: 'cat-loisirs', name: 'Loisirs, Sorties & Détente', color: '#EC4899', icon: 'Sparkles', type: 'expense' },
  { id: 'cat-shopping', name: 'Shopping & Habillement', color: '#6366F1', icon: 'ShoppingBag', type: 'expense' },
  { id: 'cat-education', name: 'Éducation & Formation', color: '#14B8A6', icon: 'GraduationCap', type: 'expense' },
  { id: 'cat-salaire', name: 'Salaire & Revenus Pro', color: '#059669', icon: 'Briefcase', type: 'income' },
  { id: 'cat-business', name: 'Ventes & Freelance', color: '#0284C7', icon: 'TrendingUp', type: 'income' },
  { id: 'cat-epargne-transfert', name: 'Épargne & Investissement', color: '#D97706', icon: 'PiggyBank', type: 'both' },
  { id: 'cat-autres', name: 'Autres & Imprévus', color: '#64748B', icon: 'HelpCircle', type: 'both' },
];

export async function register(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { numero: validatedData.numero },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        res.status(409).json({ error: 'Un compte avec cette adresse email existe déjà.' });
        return;
      }
      res.status(409).json({ error: 'Un compte avec ce numéro de téléphone existe déjà.' });
      return;
    }

    const passwordHash = await hashPassword(validatedData.password);
    const pinHash = validatedData.pin ? await hashPassword(validatedData.pin) : null;

    // Create user with transaction to initialize settings & default categories
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          nom: validatedData.nom,
          prenom: validatedData.prenom,
          numero: validatedData.numero,
          email: validatedData.email,
          passwordHash,
          pinHash,
          settings: {
            create: {
              theme: 'light',
              currency: 'FCFA',
              securityLockEnabled: !!pinHash,
            },
          },
        },
      });

      // Initialize default categories for this user
      for (const cat of DEFAULT_CATEGORIES_DATA) {
        await tx.category.create({
          data: {
            id: `${cat.id}-${newUser.id.substring(0, 8)}`,
            userId: newUser.id,
            name: cat.name,
            color: cat.color,
            icon: cat.icon,
            type: cat.type,
            isDefault: true,
            isActive: true,
          },
        });
      }

      // Create welcome notification
      await tx.notification.create({
        data: {
          userId: newUser.id,
          type: 'system',
          title: 'Bienvenue sur WealthFlow',
          message: 'Votre espace financier sécurisé est prêt. Commencez par enregistrer vos premières opérations !',
          source: 'System Onboarding',
          read: false,
          tab: 'wealth',
        },
      });

      return newUser;
    });

    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        numero: user.numero,
        email: user.email,
        hasPin: !!user.pinHash,
        registeredAt: user.createdAt.getTime(),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.identifier.toLowerCase() },
          { numero: validatedData.identifier },
        ],
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Identifiants invalides (email ou numéro non reconnu).' });
      return;
    }

    const isValidPassword = await comparePassword(validatedData.password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Mot de passe incorrect.' });
      return;
    }

    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        numero: user.numero,
        email: user.email,
        hasPin: !!user.pinHash,
        registeredAt: user.createdAt.getTime(),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        settings: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable.' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        numero: user.numero,
        email: user.email,
        hasPin: !!user.pinHash,
        registeredAt: user.createdAt.getTime(),
      },
      settings: user.settings,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié.' });
      return;
    }

    const validatedData = updateProfileSchema.parse(req.body);

    if (validatedData.email && validatedData.email !== req.user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });
      if (emailExists && emailExists.id !== req.user.id) {
        res.status(409).json({ error: 'Cette adresse email est déjà utilisée.' });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: validatedData,
    });

    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: updatedUser.id,
        nom: updatedUser.nom,
        prenom: updatedUser.prenom,
        numero: updatedUser.numero,
        email: updatedUser.email,
        hasPin: !!updatedUser.pinHash,
        registeredAt: updatedUser.createdAt.getTime(),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié.' });
      return;
    }

    const validatedData = updatePinSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable.' });
      return;
    }

    if (user.pinHash && validatedData.oldPin) {
      const isOldPinValid = await comparePassword(validatedData.oldPin, user.pinHash);
      if (!isOldPinValid) {
        res.status(400).json({ error: 'Ancien code PIN incorrect.' });
        return;
      }
    }

    const newPinHash = await hashPassword(validatedData.newPin);

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        pinHash: newPinHash,
        settings: {
          upsert: {
            create: { securityLockEnabled: true },
            update: { securityLockEnabled: true },
          },
        },
      },
    });

    res.json({ message: 'Code PIN mis à jour avec succès.' });
  } catch (error) {
    next(error);
  }
}

export async function verifyPin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié.' });
      return;
    }

    const { pin } = req.body;
    if (!pin) {
      res.status(400).json({ error: 'Code PIN requis.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.pinHash) {
      // If user has no PIN configured, fallback to checking password or grant unlock
      res.json({ valid: true });
      return;
    }

    const isValid = await comparePassword(pin, user.pinHash);
    if (!isValid) {
      res.status(400).json({ valid: false, error: 'Code PIN incorrect.' });
      return;
    }

    res.json({ valid: true });
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  res.json({ message: 'Déconnexion réussie.' });
}
