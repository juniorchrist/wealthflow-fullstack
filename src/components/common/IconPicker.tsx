import React, { useState } from 'react';
import {
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
  Search,
  ShoppingBag,
  ShoppingCart,
  Utensils,
  Wallet,
  Wifi,
  Wrench,
  X,
} from 'lucide-react';

interface IconPickerProps {
  selectedIcon?: string;
  onIconSelect: (iconName: string) => void;
  onClose: () => void;
}

// Liste d'icônes organisée par catégorie
const iconCategories = {
  'Maison & Vie': [
    { name: 'Home', icon: Home },
    { name: 'House', icon: House },
    { name: 'Utensils', icon: Utensils },
    { name: 'Coffee', icon: Coffee },
    { name: 'Baby', icon: Baby },
    { name: 'HeartPulse', icon: HeartPulse },
  ],
  'Transport': [
    { name: 'Car', icon: Car },
    { name: 'Bus', icon: Bus },
    { name: 'Plane', icon: Plane },
    { name: 'Fuel', icon: Fuel },
  ],
  'Shopping': [
    { name: 'ShoppingBag', icon: ShoppingBag },
    { name: 'ShoppingCart', icon: ShoppingCart },
    { name: 'Receipt', icon: Receipt },
    { name: 'Gift', icon: Gift },
  ],
  'Travail & Éducation': [
    { name: 'Briefcase', icon: Briefcase },
    { name: 'GraduationCap', icon: GraduationCap },
    { name: 'BookOpen', icon: BookOpen },
    { name: 'Wrench', icon: Wrench },
  ],
  'Finance': [
    { name: 'Wallet', icon: Wallet },
    { name: 'PiggyBank', icon: PiggyBank },
    { name: 'Landmark', icon: Landmark },
    { name: 'ArrowLeftRight', icon: ArrowLeftRight },
  ],
  'Loisirs': [
    { name: 'Film', icon: Film },
    { name: 'Music', icon: Music },
    { name: 'Gamepad2', icon: Gamepad2 },
    { name: 'Dumbbell', icon: Dumbbell },
  ],
  'Tech & Communication': [
    { name: 'Phone', icon: Phone },
    { name: 'Wifi', icon: Wifi },
  ],
  'Divers': [
    { name: 'CircleHelp', icon: CircleHelp },
  ],
};

export const IconPicker: React.FC<IconPickerProps> = ({
  selectedIcon,
  onIconSelect,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIconName, setSelectedIconName] = useState(selectedIcon || '');

  // Filtrer toutes les icônes selon le terme de recherche
  const allIcons = Object.values(iconCategories).flat();
  const filteredIcons = searchTerm
    ? allIcons.filter((iconItem) =>
        iconItem.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allIcons;

  const handleSelectAndClose = () => {
    if (selectedIconName) {
      onIconSelect(selectedIconName);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E8E8E8]">
          <h3 className="text-sm font-bold text-[#18181B]">Choisir une icône</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#6F6F73] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-[#F0F0F0]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <input
              type="text"
              placeholder="Rechercher une icône..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F7F7F7] border border-[#E8E8E8] rounded-lg text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
            />
          </div>
        </div>

        {/* Icons Grid */}
        <div className="p-3 max-h-80 overflow-y-auto">
          {searchTerm ? (
            // Recherche : affichage en grille simple
            <div className="grid grid-cols-6 gap-2">
              {filteredIcons.map((iconItem) => {
                const IconComponent = iconItem.icon;
                return (
                  <button
                    key={iconItem.name}
                    onClick={() => setSelectedIconName(iconItem.name)}
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                      selectedIconName === iconItem.name
                        ? 'border-[#FF5330] bg-[#FF5330]/5 text-[#FF5330]'
                        : 'border-[#E8E8E8] text-[#6F6F73]'
                    }`}
                    title={iconItem.name}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          ) : (
            // Par défaut : affichage par catégorie
            <div className="space-y-3">
              {Object.entries(iconCategories).map(([categoryName, icons]) => (
                <div key={categoryName}>
                  <h4 className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-2">
                    {categoryName}
                  </h4>
                  <div className="grid grid-cols-6 gap-2">
                    {icons.map((iconItem) => {
                      const IconComponent = iconItem.icon;
                      return (
                        <button
                          key={iconItem.name}
                          onClick={() => setSelectedIconName(iconItem.name)}
                          className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                            selectedIconName === iconItem.name
                              ? 'border-[#FF5330] bg-[#FF5330]/5 text-[#FF5330]'
                              : 'border-[#E8E8E8] text-[#6F6F73]'
                          }`}
                          title={iconItem.name}
                        >
                          <IconComponent className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredIcons.length === 0 && searchTerm && (
            <div className="text-center py-6">
              <p className="text-xs text-[#6F6F73]">Aucune icône trouvée</p>
            </div>
          )}
        </div>

        {/* Preview & Actions */}
        {selectedIconName && (
          <div className="p-3 border-t border-[#E8E8E8] bg-[#F7F7F7]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-[#6F6F73]">Icône sélectionnée :</span>
                {(() => {
                  const iconItem = allIcons.find((item) => item.name === selectedIconName);
                  if (!iconItem) return null;
                  const IconComponent = iconItem.icon;
                  return (
                    <div className="flex items-center space-x-1">
                      <div className="w-6 h-6 rounded-md bg-[#FF5330]/10 flex items-center justify-center">
                        <IconComponent className="w-3.5 h-3.5 text-[#FF5330]" />
                      </div>
                      <span className="text-xs font-semibold text-[#18181B]">{selectedIconName}</span>
                    </div>
                  );
                })()}
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg border border-[#E8E8E8] text-[10px] font-bold text-[#6F6F73] cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSelectAndClose}
                  className="px-3 py-1.5 rounded-lg bg-[#FF5330] text-white text-[10px] font-bold cursor-pointer"
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};