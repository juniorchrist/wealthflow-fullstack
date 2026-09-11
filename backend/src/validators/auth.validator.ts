import { z } from 'zod';

/**
 * Schéma de validation pour l'inscription
 */
export const registerSchema = z.object({
  body: z.object({
    prenom: z
      .string()
      .min(2, 'Le prénom doit contenir au moins 2 caractères')
      .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
    nom: z
      .string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
    email: z
      .string()
      .email('Adresse email invalide')
      .toLowerCase(),
    password: z
      .string()
      .min(4, 'Le code doit contenir exactement 4 chiffres')
      .max(4, 'Le code doit contenir exactement 4 chiffres')
      .regex(/^\d{4}$/, 'Le code doit contenir exactement 4 chiffres'),
    numero: z
      .string()
      .optional(),
    currency: z
      .string()
      .default('FCFA'),
  }),
});

/**
 * Schéma de validation pour la connexion
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Adresse email invalide')
      .toLowerCase(),
    password: z
      .string()
      .min(1, 'Le code PIN est requis'),
  }),
});

/**
 * Schéma de validation pour le refresh token
 */
export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z
      .string()
      .min(1, 'Le refresh token est requis'),
  }),
});

/**
 * Schéma de validation pour le logout
 */
export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z
      .string()
      .optional(), // Optionnel car on peut logout sans fournir le token
  }),
});

// Export des types inférés
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshInput = z.infer<typeof refreshSchema>['body'];
export type LogoutInput = z.infer<typeof logoutSchema>['body'];
