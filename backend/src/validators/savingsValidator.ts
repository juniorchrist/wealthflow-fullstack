import { z } from 'zod';

export const milestoneSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Le titre du jalon est requis'),
  targetAmount: z.number().positive('Le montant du jalon doit être positif'),
  isCompleted: z.boolean().default(false),
  completedAt: z.string().nullable().optional(),
});

export const createSavingsGoalSchema = z.object({
  id: z.string().optional(),
  month: z.string().default('global'),
  title: z.string().min(1, 'Le titre de l’objectif est requis').max(150),
  targetAmount: z.number().positive('Le montant cible doit être positif'),
  currentAmount: z.number().nonnegative().default(0),
  deadline: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  milestones: z.array(milestoneSchema).optional().default([]),
});

export const updateSavingsGoalSchema = createSavingsGoalSchema.partial();

export const contributeSavingsSchema = z.object({
  amount: z.number().positive('Le montant de contribution doit être positif'),
  milestoneId: z.string().optional(),
});
