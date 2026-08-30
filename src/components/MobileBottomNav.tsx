import React from 'react';
import { Home, AlignJustify, PieChart, PiggyBank } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  Icon: React.FC<{ size?: number; strokeWidth?: number; className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'wealth',  label: 'Accueil',      Icon: Home },
  { id: 'history', label: 'Activité',  Icon: AlignJustify },
  { id: 'budget',  label: 'Budget',       Icon: PieChart },
  { id: 'goals',   label: 'Épargne',      Icon: PiggyBank },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
}) => {
  return (
    <nav className="mobile-bottom-nav mobile-only" aria-label="Navigation mobile">
      <div className="mobile-nav-capsule">
        <div
          className="flex items-center justify-between"
          style={{ padding: '6px 8px', gap: '4px' }}
        >
          {navItems.map((item) => {
            const isActive = item.id === currentTab;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`mobile-nav-item${isActive ? ' active' : ''}`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                title={item.label}
              >
                <item.Icon
                  size={19}
                  strokeWidth={isActive ? 2.2 : 1.75}
                  className="nav-icon"
                />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};