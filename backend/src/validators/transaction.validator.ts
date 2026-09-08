import { z } from 'zod';

/**
 * Schéma de validation pour créer une transaction
 */
export const createTransactionSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Le titre est requis')
      .max(200, 'Le titre ne peut pas dépasser 200 caractères'),
    amount: z
      .number()
      .positive('Le montant doit être positif'),
    type: z
      .enum(['income', 'expense', 'savings_deposit'], {
        errorMap: () => ({ message: 'Le type doit être "income", "expense" ou "savings_deposit"' }),
      }),
    categoryId: z
      .string()
      .min(1, 'La catégorie est requise'),
    accountId: z
      .string()
      .optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La date doit être au format YYYY-MM-DD'),
    time: z
      .string()
      .optional(),
    notes: z
      .string()
      .max(500, 'Les notes ne peuvent pas dépasser 500 caractères')
      .optional(),
  }),
});

/**
 * Schéma de validation pour mettre à jour une transaction
 */
export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'L\'ID de la transaction est requis'),
  }),
  body: z.object({
    title: z
      .string()
      .min(1, 'Le titre est requis')
      .max(200, 'Le titre ne peut pas dépasser 200 caractères')
      .optional(),
    amount: z
      .number()
      .positive('Le montant doit être positif')
      .optional(),
    type: z
      .enum(['income', 'expense', 'savings_deposit'])
      .optional(),
    categoryId: z
      .string()
      .min(1, 'La catégorie est requise')
      .optional(),
    accountId: z
      .string()
      .optional()
      .nullable(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La date doit être au format YYYY-MM-DD')
      .optional(),
    time: z
      .string()
      .optional()
      .nullable(),
    notes: z
      .string()
      .max(500, 'Les notes ne peuvent pas dépasser 500 caractères')
      .optional()
      .nullable(),
  }),
});

/**
 * Schéma de validation pour les filtres de transactions
 */
export const transactionFiltersSchema = z.object({
  query: z.object({
    type: z
      .enum(['income', 'expense', 'savings_deposit'])
      .optional(),
    categoryId: z
      .string()
      .optional(),
    accountId: z
      .string()
      .optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate doit être au format YYYY-MM-DD')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate doit être au format YYYY-MM-DD')
      .optional(),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20)),
  }),
});

// Export des types inférés
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>['body'];
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>['body'];
export type TransactionParams = z.infer<typeof updateTransactionSchema>['params'];
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>['query'];
