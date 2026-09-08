import { z } from 'zod';

/**
 * Schéma de validation pour créer un budget
 */
export const createBudgetSchema = z.object({
  body: z.object({
    month: z
      .string()
      .regex(/^\d{4}-\d{2}$/, 'Le mois doit être au format YYYY-MM'),
    totalBudget: z
      .number()
      .positive('Le budget total doit être positif'),
    categories: z
      .array(
        z.object({
          categoryId: z.string().min(1, 'L\'ID de catégorie est requis'),
          limit: z.number().positive('La limite doit être positive'),
        })
      )
      .min(1, 'Au moins une catégorie est requise'),
  }),
});

/**
 * Schéma de validation pour mettre à jour un budget
 */
export const updateBudgetSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'L\'ID du budget est requis'),
  }),
  body: z.object({
    totalBudget: z
      .number()
      .positive('Le budget total doit être positif')
      .optional(),
    categories: z
      .array(
        z.object({
          categoryId: z.string().min(1, 'L\'ID de catégorie est requis'),
          limit: z.number().positive('La limite doit être positive'),
        })
      )
      .optional(),
  }),
});

/**
 * Schéma pour les filtres de budget
 */
export const budgetFiltersSchema = z.object({
  query: z.object({
    month: z
      .string()
      .regex(/^\d{4}-\d{2}$/, 'Le mois doit être au format YYYY-MM')
      .optional(),
  }),
});

// Export des types inférés
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>['body'];
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>['body'];
export type BudgetParams = z.infer<typeof updateBudgetSchema>['params'];
export type BudgetFilters = z.infer<typeof budgetFiltersSchema>['query'];
