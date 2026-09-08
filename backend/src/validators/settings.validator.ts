import { z } from 'zod';

/**
 * Schéma de validation pour mettre à jour les paramètres
 */
export const updateSettingsSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(1, 'Le prénom est requis')
      .optional(),
    lastName: z
      .string()
      .min(1, 'Le nom est requis')
      .optional(),
    phone: z
      .string()
      .optional()
      .nullable(),
    avatar: z
      .string()
      .optional()
      .nullable(),
    currency: z
      .string()
      .optional(),
    language: z
      .string()
      .optional(),
    timezone: z
      .string()
      .optional(),
    dateFormat: z
      .string()
      .optional(),
    autoLockMinutes: z
      .number()
      .int()
      .min(1, 'Le verrouillage automatique doit être d\'au moins 1 minute')
      .optional(),
  }),
});

/**
 * Schéma de validation pour configurer le PIN
 */
export const setupPinSchema = z.object({
  body: z.object({
    pin: z
      .string()
      .regex(/^\d{4,6}$/, 'Le PIN doit contenir 4 à 6 chiffres'),
  }),
});

/**
 * Schéma de validation pour vérifier le PIN
 */
export const verifyPinSchema = z.object({
  body: z.object({
    pin: z
      .string()
      .min(4, 'Le PIN doit contenir au moins 4 chiffres')
      .max(6, 'Le PIN ne peut pas dépasser 6 chiffres'),
  }),
});

// Export des types inférés
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>['body'];
export type SetupPinInput = z.infer<typeof setupPinSchema>['body'];
export type VerifyPinInput = z.infer<typeof verifyPinSchema>['body'];
