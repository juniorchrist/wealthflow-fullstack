import React from 'react';
import { Bell, Lock, Settings } from 'lucide-react';
import { UserProfile } from '../types';

interface MobileHeaderProps {
  user?: UserProfile;
  currentTab?: string;
  currentMonthKey?: string;
  onChangeMonth?: (month: string) => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onOpenNotifications?: () => void;
  onLock?: () => void;
  unreadCount?: number;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  user,
  currentTab,
  currentMonthKey,
  onChangeMonth,
  onOpenProfile,
  onOpenSettings,
  onOpenNotifications,
  onLock,
  unreadCount = 0,
}) => {
  const userInitials = user
    ? ((user.prenom?.[0] || '') + (user.nom?.[0] || '')).toUpperCase()
    : 'U';

  return (
    <header className="mobile-header mobile-only" role="banner">
      <div className="flex items-center justify-between gap-3">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--wf-primary)' }}
            aria-hidden="true"
          >
            <span className="text-white font-bold text-sm select-none">W</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold leading-tight" style={{ color: 'var(--wf-text)' }}>
              Wealth<span style={{ color: 'var(--wf-primary)' }}>Flow</span>
            </span>
            <span className="text-xs leading-tight" style={{ color: 'var(--wf-text-tertiary)' }}>
              Finances personnelles
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="touch-target rounded-xl transition-colors relative"
            style={{ color: 'var(--wf-text-secondary)' }}
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={19} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span
                className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2"
                style={{ background: 'var(--wf-primary)', borderColor: 'rgba(251,249,244,0.9)' }}
                aria-label={`${unreadCount} notifications`}
              />
            )}
          </button>

          {/* Lock */}
          {onLock && (
            <button
              onClick={onLock}
              className="touch-target rounded-xl transition-colors"
              style={{ color: 'var(--wf-text-secondary)' }}
              aria-label="Verrouiller"
              title="Verrouiller"
            >
              <Lock size={18} strokeWidth={1.75} />
            </button>
          )}

          {/* Profile / Menu */}
          <button
            onClick={onOpenProfile || onOpenSettings}
            className="touch-target rounded-xl transition-colors"
            aria-label="Profil et menu"
            title="Profil et menu"
          >
            {userInitials ? (
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold select-none"
                style={{
                  background: 'var(--wf-primary-soft)',
                  color: 'var(--wf-primary)',
                  border: '1.5px solid rgba(255,83,48,0.18)',
                }}
              >
                {userInitials}
              </span>
            ) : (
              <Settings size={18} strokeWidth={1.75} style={{ color: 'var(--wf-text-secondary)' }} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};