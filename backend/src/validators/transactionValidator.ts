import { z } from 'zod';

export const createTransactionSchema = z.object({
  id: z.string().optional(),
  amount: z.number().positive('Le montant doit être supérieur à 0'),
  type: z.enum(['expense', 'income'], {
    errorMap: () => ({ message: "Le type doit être 'expense' ou 'income'" }),
  }),
  categoryId: z.string().min(1, 'La catégorie est requise'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  note: z.string().max(500).optional().nullable(),
});

export const updateTransactionSchema = createTransactionSchema.partial();
