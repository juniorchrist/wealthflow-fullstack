import { z } from 'zod';

/**
 * Schéma de validation pour l'inscription
 */
export const registerSchema = z.object({
  body: z.object({
    prenom: z
      .string()
      .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
      .optional(),
    nom: z
      .string()
      .max(50, 'Le nom ne peut pas dépasser 50 caractères')
      .optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    name: z.string().optional(),
    email: z
      .string()
      .email('Adresse email invalide')
      .toLowerCase(),
    password: z
      .string()
      .min(4, 'Le code secret doit comporter au moins 4 caractères')
      .max(20, 'Le code secret ne peut pas dépasser 20 caractères'),
    numero: z
      .string()
      .optional()
      .nullable(),
    phone: z
      .string()
      .optional()
      .nullable(),
    currency: z
      .string()
      .optional()
      .default('FCFA'),
  }).transform((data) => {
    const prenom = data.prenom || data.firstName || (data.name ? data.name.split(' ')[0] : 'Utilisateur');
    const nom = data.nom || data.lastName || (data.name ? data.name.split(' ').slice(1).join(' ') : 'WealthFlow');
    const numero = data.numero || data.phone || null;
    return {
      email: data.email,
      password: data.password,
      prenom: prenom || 'Utilisateur',
      nom: nom || 'WealthFlow',
      numero: numero || undefined,
      currency: data.currency || 'FCFA',
    };
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
