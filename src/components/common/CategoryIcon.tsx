import React from 'react';
import {
  ArrowLeftRight,
  Baby,
  BookOpen,
  Briefcase,
  Bus,
  Car,
  CircleHelp,
  Coffee,
  DollarSign,
  Dumbbell,
  Film,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  House,
  Landmark,
  Music,
  Phone,
  PiggyBank,
  Plane,
  Receipt,
  Shield,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Utensils,
  Wallet,
  Wifi,
  Wrench,
  Zap,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

// Map icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  ArrowLeftRight,
  Baby,
  BookOpen,
  Briefcase,
  Bus,
  Car,
  CircleHelp,
  Coffee,
  Dumbbell,
  Film,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  House,
  Landmark,
  Music,
  Phone,
  PiggyBank,
  Plane,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Utensils,
  Wallet,
  Wifi,
  Wrench,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size }) => {
  const iconProps = { className, size };

  // First, try to get the icon directly by name (for new IconPicker selections)
  const DirectIcon = iconMap[name];
  if (DirectIcon) {
    return <DirectIcon {...iconProps} />;
  }

  // Fallback to legacy category name mapping for existing categories
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
