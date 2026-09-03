import React from 'react';
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  LayoutDashboard,
  Lightbulb,
  Lock,
  PieChart,
  PiggyBank,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Tags,
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { ActiveTab } from '../../types';
import { BrandLogo } from '../common/BrandLogo';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    notifications,
    setIsNewTransactionModalOpen,
    lockApp,
    userProfile,
  } = useWealth();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: {
    section: string;
    items: {
      id: ActiveTab;
      label: string;
      icon: React.ElementType;
      badge?: number | string;
    }[];
  }[] = [
    {
      section: 'PRINCIPAL',
      items: [
        { id: 'dashboard', label: 'Vue d’ensemble', icon: LayoutDashboard },
        { id: 'transactions', label: 'Activité', icon: ArrowLeftRight },
        { id: 'budget', label: 'Budget', icon: PieChart },
        { id: 'savings', label: 'Épargne & Tirelires', icon: PiggyBank },
      ],
    },
    {
      section: 'OUTILS & ANALYSES',
      items: [
        { id: 'analytics', label: 'Analyses', icon: BarChart3 },
        { id: 'strategy', label: 'Stratégie', icon: Lightbulb },
        { id: 'categories', label: 'Catégories', icon: Tags },
      ],
    },
    {
      section: 'GESTION',
      items: [
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
        { id: 'settings', label: 'Paramètres', icon: Settings },
        { id: 'security', label: 'Sécurité & PIN', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <aside
      id="sidebar-desktop"
      className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-[#E8E8E8] h-screen sticky top-0 px-3.5 py-4 z-30 select-none overflow-y-auto"
    >
      {/* Brand Header with Full PNG Logo in dark container for 100% contrast */}
      <div className="px-0.5 mb-3.5">
        <div
          className="cursor-pointer group transition-all"
          onClick={() => setActiveTab('dashboard')}
          title="WealthFlow - Gestion de Finance"
        >
          <BrandLogo size="md" showBadge={true} withDarkContainer={true} className="w-full" />
        </div>
      </div>

      {/* Primary CTA Button */}
      <div className="px-0.5 mb-4">
        <button
          id="btn-new-transaction-sidebar"
          onClick={() => setIsNewTransactionModalOpen(true)}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-3.5 rounded-xl bg-[#FF5330] hover:bg-[#E84524] active:scale-[0.98] text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Nouvelle transaction</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-4 px-0.5">
        {navItems.map((group) => (
          <div key={group.section} className="space-y-0.5">
            <p className="px-2.5 text-[10px] font-bold tracking-wider text-[#A1A1AA] uppercase mb-1">
              {group.section}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF5330]/10 text-[#FF5330]'
                      : 'text-[#52525B] hover:text-[#18181B] hover:bg-[#F7F7F7]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      className={`w-3.5 h-3.5 transition-colors ${
                        isActive ? 'text-[#FF5330]' : 'text-[#71717A]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FF5330] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Financial Health / Progress Widget */}
      <div className="mt-3 pt-3 border-t border-[#E8E8E8] space-y-2">
        <div className="p-2.5 rounded-xl bg-[#F7F7F7] border border-[#E8E8E8] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#18181B] flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-[#FF5330]" />
              <span>Santé financière</span>
            </span>
            <span className="text-[11px] font-bold text-[#FF5330] num-tabular">78%</span>
          </div>
          <div className="w-full h-1.5 bg-[#E8E8E8] rounded-full overflow-hidden">
            <div className="h-full bg-[#FF5330] rounded-full transition-all duration-500" style={{ width: '78%' }} />
          </div>
          <p className="text-[10px] text-[#6F6F73] font-medium flex items-center justify-between">
            <span>Vous êtes sur la bonne voie !</span>
          </p>
        </div>

        {/* User Card & Lock button */}
        <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#F7F7F7] transition-colors">
          <div
            className="flex items-center space-x-2 cursor-pointer flex-1 min-w-0"
            onClick={() => setActiveTab('settings')}
          >
            <div className="w-7 h-7 rounded-full bg-[#18181B] text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0">
              {userProfile.name
                ? userProfile.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'WF'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#18181B] truncate">{userProfile.name}</p>
              <p className="text-[10px] text-[#6F6F73] truncate">{userProfile.email}</p>
            </div>
          </div>
          <button
            id="btn-lock-app-sidebar"
            onClick={lockApp}
            title="Verrouiller l’application"
            className="p-1 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#E8E8E8] transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
