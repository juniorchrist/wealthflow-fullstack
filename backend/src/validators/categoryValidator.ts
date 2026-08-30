import { z } from 'zod';

export const createCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Le nom de catégorie est requis').max(100).trim(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Couleur hexadécimale invalide'),
  icon: z.string().min(1, 'Icône requise'),
  type: z.enum(['expense', 'income', 'both'], {
    errorMap: () => ({ message: "Le type doit être 'expense', 'income' ou 'both'" }),
  }),
});

export const updateCategorySchema = createCategorySchema.partial();
