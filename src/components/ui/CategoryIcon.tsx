import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUtensils, 
  faHome, 
  faCar, 
  faShoppingBag, 
  faHeart, 
  faGamepad, 
  faBook, 
  faBriefcase, 
  faPlane, 
  faMobile, 
  faGraduationCap, 
  faKitMedical,
  faPills,
  faCoffee,
  faFilm,
  faMusic,
  faCamera,
  faLaptop,
  faTools,
  faBaby,
  faPaw,
  faGift,
  faQuestion
} from '@fortawesome/free-solid-svg-icons';

interface CategoryIconProps {
  name?: string;
  category?: { icon?: string; color?: string };
  className?: string;
  size?: string;
}

const iconMap: Record<string, any> = {
  Utensils: faUtensils,
  Home: faHome,
  Car: faCar,
  ShoppingBag: faShoppingBag,
  Heart: faHeart,
  Gamepad: faGamepad,
  Book: faBook,
  Briefcase: faBriefcase,
  Plane: faPlane,
  MobileAlt: faMobile,
  GraduationCap: faGraduationCap,
  MedicalKit: faKitMedical,
  Pills: faPills,
  Coffee: faCoffee,
  Film: faFilm,
  Music: faMusic,
  Camera: faCamera,
  Laptop: faLaptop,
  Tools: faTools,
  Baby: faBaby,
  Pet: faPaw,
  Gift: faGift,
  HelpCircle: faQuestion,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, category, className = '', size = 'text-sm' }) => {
  const iconName = name || category?.icon || 'HelpCircle';
  const color = category?.color || '#6B6B68';
  const icon = iconMap[iconName] || faQuestion;

  return (
    <FontAwesomeIcon 
      icon={icon} 
      className={className}
      style={{ color }}
    />
  );
};
