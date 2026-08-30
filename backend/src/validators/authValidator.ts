import { z } from 'zod';

export const registerSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(100),
  prenom: z.string().min(1, 'Le prénom est requis').max(100),
  numero: z.string().min(6, 'Numéro de téléphone incomplet').max(30),
  email: z.string().email('Adresse email invalide').toLowerCase().trim(),
  password: z.string().min(4, 'Le mot de passe doit contenir au moins 4 caractères'),
  pin: z.string().regex(/^\d{4,8}$/, 'Le PIN doit contenir 4 à 8 chiffres').optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email ou numéro de téléphone requis').trim(),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const updateProfileSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(100).optional(),
  prenom: z.string().min(1, 'Le prénom est requis').max(100).optional(),
  numero: z.string().min(6, 'Numéro de téléphone incomplet').max(30).optional(),
  email: z.string().email('Adresse email invalide').toLowerCase().trim().optional(),
});

export const updatePinSchema = z.object({
  oldPin: z.string().optional(),
  newPin: z.string().regex(/^\d{4,8}$/, 'Le PIN doit contenir 4 à 8 chiffres'),
});
