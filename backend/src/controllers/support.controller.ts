import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

/**
 * Créer un ticket de support / centre d'appel
 * POST /api/support/tickets
 */
export const createSupportTicketHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, subject, category, message, userId } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({
        success: false,
        message: 'Veuillez renseigner tous les champs obligatoires (nom, email, sujet, message)',
      });
      return;
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: userId || null,
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        subject: String(subject).trim(),
        category: String(category || 'general').trim(),
        message: String(message).trim(),
        status: 'open',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Votre message a été transmis à l’équipe d’assistance avec succès. Nous vous répondrons très rapidement.',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Vérifier le statut de bannissement d'un compte et récupérer le motif réel
 * GET /api/support/ban-status?email=...
 */
export const checkBanStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const emailParam = req.query.email;
    if (!emailParam || typeof emailParam !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Adresse email requise pour la vérification',
      });
      return;
    }

    const email = emailParam.trim().toLowerCase();
    const ban = await prisma.banRecord.findUnique({
      where: { email },
    });

    if (!ban) {
      res.status(200).json({
        success: true,
        data: {
          isBanned: false,
          message: 'Ce compte n’a fait l’objet d’aucune mesure de bannissement ou de suspension.',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        isBanned: true,
        email: ban.email,
        nom: ban.nom,
        prenom: ban.prenom,
        reason: ban.reason,
        bannedAt: ban.bannedAt,
        bannedBy: ban.bannedBy,
      },
    });
  } catch (error) {
    next(error);
  }
};
