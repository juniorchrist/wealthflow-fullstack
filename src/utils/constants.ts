import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-alimentation',
    name: 'Alimentation & Courses',
    color: '#10B981', // Emerald
    icon: 'Utensils',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-transport',
    name: 'Transport & Carburant',
    color: '#3B82F6', // Blue
    icon: 'Car',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-logement',
    name: 'Logement & Loyer',
    color: '#8B5CF6', // Purple
    icon: 'Home',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-factures',
    name: 'Factures (CIE / SODECI / Internet)',
    color: '#F59E0B', // Amber
    icon: 'Zap',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-sante',
    name: 'Santé & Pharmacie',
    color: '#EF4444', // Red
    icon: 'HeartPulse',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-loisirs',
    name: 'Loisirs, Sorties & Détente',
    color: '#EC4899', // Pink
    icon: 'Sparkles',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-shopping',
    name: 'Shopping & Habillement',
    color: '#6366F1', // Indigo
    icon: 'ShoppingBag',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-education',
    name: 'Éducation & Formation',
    color: '#14B8A6', // Teal
    icon: 'GraduationCap',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-salaire',
    name: 'Salaire & Revenus Pro',
    color: '#059669', // Dark Emerald
    icon: 'Briefcase',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat-business',
    name: 'Ventes & Freelance',
    color: '#0284C7', // Sky
    icon: 'TrendingUp',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat-epargne-transfert',
    name: 'Épargne & Investissement',
    color: '#D97706', // Amber dark
    icon: 'PiggyBank',
    type: 'both',
    isDefault: true,
  },
  {
    id: 'cat-autres',
    name: 'Autres & Imprévus',
    color: '#64748B', // Slate
    icon: 'HelpCircle',
    type: 'both',
    isDefault: true,
  },
];

export const AVAILABLE_ICONS = [
  'Utensils',
  'Car',
  'Home',
  'Zap',
  'HeartPulse',
  'Sparkles',
  'ShoppingBag',
  'GraduationCap',
  'Briefcase',
  'TrendingUp',
  'PiggyBank',
  'HelpCircle',
  'Coffee',
  'Smartphone',
  'Plane',
  'Wifi',
  'Gift',
  'Music',
  'Camera',
  'BookOpen',
  'Shield',
  'Layers',
  'CreditCard',
  'DollarSign',
  'Package',
];

export const AVAILABLE_COLORS = [
  '#10B981', // Emerald
  '#059669', // Dark emerald
  '#3B82F6', // Blue
  '#0284C7', // Sky
  '#8B5CF6', // Purple
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#D97706', // Orange
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#64748B', // Slate
  '#71717A', // Zinc
  '#78716C', // Stone
];
