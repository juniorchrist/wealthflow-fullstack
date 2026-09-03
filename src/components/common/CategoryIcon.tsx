import React from 'react';
import {
  Briefcase,
  Car,
  Coffee,
  DollarSign,
  Film,
  GraduationCap,
  HeartPulse,
  Home,
  PiggyBank,
  Plane,
  Shield,
  ShoppingBag,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size }) => {
  const iconProps = { className, size };

  switch (name?.toLowerCase()) {
    case 'utensils':
    case 'alimentation':
    case 'nourriture':
    case 'restaurant':
      return <Utensils {...iconProps} />;
    case 'car':
    case 'transport':
    case 'uber':
    case 'voiture':
      return <Car {...iconProps} />;
    case 'home':
    case 'logement':
    case 'charges':
    case 'loyer':
      return <Home {...iconProps} />;
    case 'film':
    case 'divertissement':
    case 'loisirs':
    case 'netflix':
      return <Film {...iconProps} />;
    case 'heartpulse':
    case 'santé':
    case 'sante':
    case 'pharmacie':
      return <HeartPulse {...iconProps} />;
    case 'piggybank':
    case 'épargne':
    case 'epargne':
    case 'investissement':
      return <PiggyBank {...iconProps} />;
    case 'shoppingbag':
    case 'shopping':
    case 'courses':
      return <ShoppingBag {...iconProps} />;
    case 'wallet':
    case 'salaire':
    case 'revenus':
      return <Wallet {...iconProps} />;
    case 'briefcase':
    case 'freelance':
    case 'business':
    case 'travail':
      return <Briefcase {...iconProps} />;
    case 'plane':
    case 'voyage':
    case 'dubaï':
      return <Plane {...iconProps} />;
    case 'shield':
    case 'urgence':
    case 'sécurité':
      return <Shield {...iconProps} />;
    case 'graduationcap':
    case 'formation':
    case 'études':
      return <GraduationCap {...iconProps} />;
    case 'coffee':
      return <Coffee {...iconProps} />;
    case 'zap':
    case 'factures':
    case 'électricité':
      return <Zap {...iconProps} />;
    case 'trendingup':
      return <TrendingUp {...iconProps} />;
    default:
      return <DollarSign {...iconProps} />;
  }
};
