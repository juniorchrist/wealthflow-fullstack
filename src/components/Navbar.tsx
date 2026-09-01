import React from 'react';
import {
  Home,
  AlignJustify,
  PieChart,
  PiggyBank,
  Tag,
  BarChart3,
  TrendingUp,
  Settings,
  Lock,
  Plus,
  Bell,
  LogOut,
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentMonthKey?: string;
  onChangeMonth?: (month: string) => void;
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
  unreadCount?: number;
  user?: UserProfile;
  onLock?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentMonthKey,
  onChangeMonth,
  onOpenNotifications,
  onOpenSettings,
  unreadCount = 0,
  user,
  onLock,
  onLogout,
}) => {
  const mainTabs = [
    { id: 'wealth', label: "Vue d'ensemble", Icon: Home },
    { id: 'history', label: 'Transactions', Icon: AlignJustify },
    { id: 'budget', label: 'Budget', Icon: PieChart },
    { id: 'goals', label: 'Épargne', Icon: PiggyBank },
  ];

  const secondaryTabs = [
    { id: 'analytics', label: 'Analyses', Icon: BarChart3 },
    { id: 'categories', label: 'Catégories', Icon: Tag },
    { id: 'invest', label: 'Stratégie', Icon: TrendingUp },
    { id: 'settings', label: 'Paramètres', Icon: Settings },
  ];

  const userInitials = user
    ? ((user.prenom?.[0] || '') + (user.nom?.[0] || '')).toUpperCase()
    : 'U';

  // Compact icon rail for tablet (md..lg range). Replaces the full sidebar so
  // there is never a big labeled sidebar plus an overlapping nav on tablets.
  const compactTabs = [
    ...mainTabs,
    ...secondaryTabs,
    { id: 'settings', label: 'Réglages', Icon: Settings },
  ];

  return (
    <>
      {/* Compact tablet icon rail (md to lg only) */}
      <aside
        className="hidden md:flex lg:hidden fixed left-0 top-0 bottom-0 flex-col z-30 w-[72px] items-center"
        style={{
          background: 'var(--wf-surface)',
          borderRight: '1px solid var(--wf-border)',
        }}
        aria-label="Navigation tablette"
      >
        {/* Brand */}
        <button
          onClick={() => onSelectTab('wealth')}
          className="mt-5 mb-4 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm cursor-pointer"
          style={{ background: 'var(--wf-primary)' }}
          title="WealthFlow"
        >
          <span className="font-bold text-lg">W</span>
        </button>

        <nav className="flex-1 flex flex-col gap-1.5 w-full px-2 overflow-y-auto overflow-x-hidden">
          {compactTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                title={tab.label}
                className="w-full flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all cursor-pointer"
                style={{
                  background: isActive ? 'var(--wf-primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--wf-text-secondary)',
                }}
              >
                <tab.Icon size={19} strokeWidth={isActive ? 2.2 : 1.75} />
              </button>
            );
          })}
        </nav>

        <div className="py-4 flex flex-col items-center gap-2 w-full px-2 border-t" style={{ borderColor: 'var(--wf-border)' }}>
          <button
            onClick={() => onSelectTab('add')}
            title="Nouvelle transaction"
            className="w-full flex items-center justify-center py-2.5 rounded-xl btn-primary touch-target"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
          <button
            onClick={onOpenNotifications}
            title="Notifications"
            className="relative flex items-center justify-center w-full py-2 rounded-lg transition-colors hover:bg-[var(--wf-surface-soft)]"
            style={{ color: 'var(--wf-text-secondary)' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-3 w-2 h-2 rounded-full"
                style={{ background: 'var(--wf-primary)' }}
              />
            )}
          </button>
          {onLock ? (
            <button
              onClick={onLock}
              title="Verrouiller"
              className="w-full py-2 rounded-lg transition-colors hover:bg-[var(--wf-surface-soft)]"
              style={{ color: 'var(--wf-text-tertiary)' }}
            >
              <Lock size={17} />
            </button>
          ) : (
            <span className="py-2" />
          )}
        </div>
      </aside>

      {/* Full labeled sidebar (large screens and up) */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col z-30"
        style={{
          background: 'var(--wf-surface)',
          borderRight: '1px solid var(--wf-border)',
        }}
        aria-label="Navigation latérale"
      >
      {/* Brand Header */}
      <div className="p-5 pb-4" style={{ borderBottom: '1px solid var(--wf-border)' }}>
        <button
          onClick={() => onSelectTab('wealth')}
          className="flex items-center gap-3 cursor-pointer text-left focus:outline-none w-full"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
            style={{ background: 'var(--wf-primary)' }}
          >
            <span className="font-bold text-lg">W</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-base tracking-tight" style={{ color: 'var(--wf-text)' }}>
              Wealth<span style={{ color: 'var(--wf-primary)' }}>Flow</span>
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--wf-text-tertiary)' }}>
              Finances personnelles
            </span>
          </div>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {/* Main Tabs */}
        <div className="space-y-1 mb-3">
          {mainTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-left"
                style={{
                  background: isActive ? 'var(--wf-primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--wf-text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                <tab.Icon size={18} strokeWidth={isActive ? 2.2 : 1.75} />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Separator & Secondary Tools */}
        <div className="pt-3 border-t space-y-1" style={{ borderColor: 'var(--wf-border)' }}>
          <p className="px-3 text-[10.5px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--wf-text-tertiary)' }}>
            Outils & Analyses
          </p>
          {secondaryTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all cursor-pointer text-left"
                style={{
                  background: isActive ? 'var(--wf-primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--wf-text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                <tab.Icon size={16} strokeWidth={isActive ? 2.2 : 1.75} />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Quick Action Button */}
      <div className="p-3">
        <button
          onClick={() => onSelectTab('add')}
          className="w-full py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 btn-primary touch-target"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Nouvelle Transaction</span>
        </button>
      </div>

      {/* Bottom Profile & Actions */}
      <div className="p-3 border-t space-y-1" style={{ borderColor: 'var(--wf-border)' }}>
        {/* User Card */}
        {user && (
          <div
            onClick={onOpenSettings}
            className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[var(--wf-surface-soft)] transition-colors mb-1"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'var(--wf-primary)' }}
            >
              {userInitials || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: 'var(--wf-text)' }}>
                {user.prenom} {user.nom}
              </p>
              <p className="text-[11px] truncate" style={{ color: 'var(--wf-text-tertiary)' }}>
                {user.email || 'Mon profil'}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={onOpenNotifications}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-[var(--wf-surface-soft)] relative"
            style={{ color: 'var(--wf-text-secondary)' }}
            title="Notifications"
          >
            <Bell size={15} />
            <span>Notifs</span>
            {unreadCount > 0 && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: 'var(--wf-primary)' }}
              />
            )}
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-[var(--wf-surface-soft)]"
            style={{ color: currentTab === 'settings' ? 'var(--wf-primary)' : 'var(--wf-text-secondary)' }}
            title="Paramètres"
          >
            <Settings size={15} />
            <span>Réglages</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-[var(--wf-surface-soft)]"
              style={{ color: 'var(--wf-text-tertiary)' }}
              title="Se déconnecter"
            >
              <LogOut size={15} />
              <span>Quitter</span>
            </button>
          )}

          {onLock && (
            <button
              onClick={onLock}
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--wf-surface-soft)]"
              style={{ color: 'var(--wf-text-tertiary)' }}
              title="Verrouiller"
            >
              <Lock size={15} />
            </button>
          )}
        </div>
      </div>
      </aside>
    </>
  );
};