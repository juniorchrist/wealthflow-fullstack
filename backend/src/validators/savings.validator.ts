import { z } from 'zod';

/**
 * Schéma de validation pour créer un objectif d'épargne
 */
export const createSavingsGoalSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Le titre est requis')
      .max(200, 'Le titre ne peut pas dépasser 200 caractères'),
    targetAmount: z
      .number()
      .positive('Le montant cible doit être positif'),
    deadline: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La date limite doit être au format YYYY-MM-DD'),
    icon: z
      .string()
      .min(1, 'L\'icône est requise'),
    color: z
      .string()
      .min(1, 'La couleur est requise'),
  }),
});

/**
 * Schéma de validation pour mettre à jour un objectif
 */
export const updateSavingsGoalSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'L\'ID de l\'objectif est requis'),
  }),
  body: z.object({
    title: z
      .string()
      .min(1, 'Le titre est requis')
      .max(200, 'Le titre ne peut pas dépasser 200 caractères')
      .optional(),
    targetAmount: z
      .number()
      .positive('Le montant cible doit être positif')
      .optional(),
    deadline: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La date limite doit être au format YYYY-MM-DD')
      .optional(),
    icon: z
      .string()
      .optional(),
    color: z
      .string()
      .optional(),
  }),
});

/**
 * Schéma de validation pour ajouter un dépôt
 */
export const addDepositSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'L\'ID de l\'objectif est requis'),
  }),
  body: z.object({
    amount: z
      .number()
      .positive('Le montant doit être positif'),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La date doit être au format YYYY-MM-DD')
      .optional(),
  }),
});

// Export des types inférés
export type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalSchema>['body'];
export type UpdateSavingsGoalInput = z.infer<typeof updateSavingsGoalSchema>['body'];
export type SavingsGoalParams = z.infer<typeof updateSavingsGoalSchema>['params'];
export type AddDepositInput = z.infer<typeof addDepositSchema>['body'];
