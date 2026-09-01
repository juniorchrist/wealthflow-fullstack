import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Tag,
  Bell,
  Settings,
  Lock,
  ChevronRight,
  UserRound,
} from 'lucide-react';
import { UserProfile } from '../types';
import { MobileBottomSheet } from './MobileBottomSheet';

interface MobileProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile;
  userProfile?: UserProfile;
  unreadCount?: number;
  onNavigate: (tab: string) => void;
  onOpenNotifications?: () => void;
  onLock?: () => void;
}

interface MenuEntry {
  id: string;
  tab: string;
  label: string;
  subtitle: string;
  Icon: React.FC<{ size?: number; strokeWidth?: number }>;
}

const tools: MenuEntry[] = [
  { id: 'analytics', tab: 'analytics', label: 'Analyses', subtitle: 'Comprendre vos habitudes financières', Icon: BarChart3 },
  { id: 'invest', tab: 'invest', label: 'Stratégie', subtitle: 'Recommandations personnalisées', Icon: TrendingUp },
  { id: 'categories', tab: 'categories', label: 'Catégories', subtitle: 'Organiser vos dépenses', Icon: Tag },
];

export const MobileProfileMenu: React.FC<MobileProfileMenuProps> = ({
  isOpen,
  onClose,
  user,
  userProfile,
  unreadCount = 0,
  onNavigate,
  onOpenNotifications,
  onLock,
}) => {
  const currentUser = user || userProfile;
  const userInitials = currentUser
    ? ((currentUser.prenom?.[0] || '') + (currentUser.nom?.[0] || '')).toUpperCase()
    : '';

  const handleNavigate = (tab: string) => {
    onNavigate(tab);
    onClose();
  };

  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Mon espace"
    >
      {/* Profile card */}
      <div
        className="flex items-center gap-3 p-3 rounded-xl"
        style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0"
          style={{ background: 'var(--wf-primary)' }}
        >
          {userInitials || <UserRound size={20} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--wf-text)' }}>
            {currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Utilisateur'}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--wf-text-tertiary)' }}>
            {currentUser?.email || 'Mon profil'}
          </p>
        </div>
        <ChevronRight size={16} style={{ color: 'var(--wf-text-tertiary)' }} />
      </div>

      {/* OUTILS & ANALYSES */}
      <div className="mt-5">
        <p
          className="text-[10.5px] font-bold uppercase tracking-wider mb-2 px-1"
          style={{ color: 'var(--wf-text-tertiary)' }}
        >
          Outils & Analyses
        </p>

        <div className="space-y-2">
          {tools.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.tab)}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors cursor-pointer active:scale-[0.99]"
              style={{
                background: 'var(--wf-surface)',
                border: '1px solid var(--wf-border)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--wf-primary-soft)', color: 'var(--wf-primary)' }}
              >
                <item.Icon size={18} strokeWidth={1.9} />
              </div>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold" style={{ color: 'var(--wf-text)' }}>
                  {item.label}
                </span>
                <span className="block text-xs leading-snug" style={{ color: 'var(--wf-text-tertiary)' }}>
                  {item.subtitle}
                </span>
              </span>
              <ChevronRight size={16} style={{ color: 'var(--wf-text-tertiary)' }} />
            </button>
          ))}
        </div>
      </div>

      {/* GESTION */}
      <div className="mt-6">
        <p
          className="text-[10.5px] font-bold uppercase tracking-wider mb-2 px-1"
          style={{ color: 'var(--wf-text-tertiary)' }}
        >
          Gestion
        </p>

        <div
          className="divide-y rounded-xl overflow-hidden"
          style={{ background: 'var(--wf-surface)', border: '1px solid var(--wf-border)' }}
        >
          <button
            onClick={() => {
              onClose();
              if (onOpenNotifications) onOpenNotifications();
            }}
            className="w-full flex items-center gap-3 px-3 py-3 text-left transition-colors cursor-pointer relative"
          >
            <Bell size={18} strokeWidth={1.75} style={{ color: 'var(--wf-text-secondary)' }} />
            <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--wf-text)' }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--wf-primary)', color: 'white' }}
              >
                {unreadCount}
              </span>
            )}
            <ChevronRight size={16} style={{ color: 'var(--wf-text-tertiary)' }} />
          </button>

          <button
            onClick={() => handleNavigate('settings')}
            className="w-full flex items-center gap-3 px-3 py-3 text-left transition-colors cursor-pointer"
          >
            <Settings size={18} strokeWidth={1.75} style={{ color: 'var(--wf-text-secondary)' }} />
            <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--wf-text)' }}>
              Réglages
            </span>
            <ChevronRight size={16} style={{ color: 'var(--wf-text-tertiary)' }} />
          </button>

          {onLock && (
            <button
              onClick={() => {
                onClose();
                if (onLock) onLock();
              }}
              className="w-full flex items-center gap-3 px-3 py-3 text-left transition-colors cursor-pointer"
            >
              <Lock size={18} strokeWidth={1.75} style={{ color: 'var(--wf-text-secondary)' }} />
              <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--wf-text)' }}>
                Sécurité
              </span>
              <ChevronRight size={16} style={{ color: 'var(--wf-text-tertiary)' }} />
            </button>
          )}
        </div>
      </div>
    </MobileBottomSheet>
  );
};
