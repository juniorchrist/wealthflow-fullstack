import { z } from 'zod';

/**
 * Schéma pour les filtres de notifications
 */
export const notificationFiltersSchema = z.object({
  query: z.object({
    read: z
      .string()
      .optional()
      .transform((val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return undefined;
      }),
    type: z
      .enum(['info', 'warning', 'success', 'alert'])
      .optional(),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 50)),
  }),
});

/**
 * Schéma pour les paramètres de notification
 */
export const notificationParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'L\'ID de la notification est requis'),
  }),
});

// Export des types inférés
export type NotificationFilters = z.infer<typeof notificationFiltersSchema>['query'];
export type NotificationParams = z.infer<typeof notificationParamsSchema>['params'];
