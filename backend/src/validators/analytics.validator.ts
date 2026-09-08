import { z } from 'zod';

/**
 * Schéma pour les filtres d'analytics
 */
export const analyticsFiltersSchema = z.object({
  query: z.object({
    month: z
      .string()
      .regex(/^\d{4}-\d{2}$/, 'Le mois doit être au format YYYY-MM')
      .optional(),
    type: z
      .enum(['income', 'expense'])
      .optional(),
  }),
});

// Export des types inférés
export type AnalyticsFilters = z.infer<typeof analyticsFiltersSchema>['query'];
