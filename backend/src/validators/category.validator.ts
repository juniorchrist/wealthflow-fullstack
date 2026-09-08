import { z } from 'zod';

/**
 * Schéma de validation pour créer une catégorie
 */
export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
    icon: z
      .string()
      .min(1, 'L\'icône est requise'),
    color: z
      .string()
      .regex(/^#[0-9A-F]{6}$/i, 'La couleur doit être au format hexadécimal (#RRGGBB)'),
    budgetLimit: z
      .number()
      .min(0, 'La limite de budget ne peut pas être négative')
      .default(0),
    type: z
      .enum(['expense', 'income'], {
        errorMap: () => ({ message: 'Le type doit être "expense" ou "income"' }),
      }),
  }),
});

/**
 * Schéma de validation pour mettre à jour une catégorie
 */
export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'L\'ID de la catégorie est requis'),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(50, 'Le nom ne peut pas dépasser 50 caractères')
      .optional(),
    icon: z
      .string()
      .min(1, 'L\'icône est requise')
      .optional(),
    color: z
      .string()
      .regex(/^#[0-9A-F]{6}$/i, 'La couleur doit être au format hexadécimal (#RRGGBB)')
      .optional(),
    budgetLimit: z
      .number()
      .min(0, 'La limite de budget ne peut pas être négative')
      .optional(),
  }),
});

/**
 * Schéma de validation pour supprimer une catégorie
 */
export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'L\'ID de la catégorie est requis'),
  }),
});

// Export des types inférés
export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];
export type CategoryParams = z.infer<typeof updateCategorySchema>['params'];
