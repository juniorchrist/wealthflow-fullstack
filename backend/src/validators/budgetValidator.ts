import { z } from 'zod';

export const upsertBudgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Format de mois invalide (YYYY-MM)'),
  totalBudget: z.number().nonnegative('Le budget total ne peut pas être négatif'),
  savingsTarget: z.number().nonnegative('L’objectif d’épargne ne peut pas être négatif').optional().default(0),
  categoryBudgets: z.record(z.string(), z.number().nonnegative()).optional(),
});
