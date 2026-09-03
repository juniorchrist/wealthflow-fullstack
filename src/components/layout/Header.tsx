import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Hand,
  Lock,
  Plus,
  Settings,
  Shield,
  User,
  X,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useWealth } from '../../context/WealthContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle = 'Voici un aperçu de votre santé financière aujourd'hui.',
}) => {
  const {
    userProfile,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setIsNewTransactionModalOpen,
    setActiveTab,
    lockApp,
    logout,
  } = useWealth();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const firstName = userProfile.name.split(' ')[0] || 'Junior';
  const userInitials = userProfile.name
    ? userProfile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'WF';

  return (
    <header
      id="main-header"
      className="w-full bg-white/95 backdrop-blur-md border-b border-[#E8E8E8] sticky top-0 z-20 px-3.5 sm:px-5 lg:px-6 py-2.5 sm:py-3 transition-all"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Context */}
        <div className="flex-1 min-w-0 flex items-center gap-2.5">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="cursor-pointer flex-shrink-0 active:scale-95 transition-transform"
            title="WealthFlow"
          >
            <BrandLogo size="sm" showBadge={false} withDarkContainer={true} />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-extrabold text-[#18181B] tracking-tight flex items-center gap-1.5 truncate">
              <span>{title || `Bonjour ${firstName}`}</span>
              <Hand className="w-4 h-4 text-[#FF5330]" />
            </h1>
            <p className="text-[11px] sm:text-xs text-[#6F6F73] font-normal truncate mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* Quick Add Button (Desktop only, mobile has FAB) */}
          <button
            id="header-btn-new-tx"
            onClick={() => setIsNewTransactionModalOpen(true)}
            className="hidden sm:inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-lg bg-[#FF5330] hover:bg-[#E84524] active:scale-95 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Ajouter</span>
          </button>

          {/* Notification Button & Dropdown */}
          <div className="relative">
            <button
              id="btn-notifications-toggle"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileMenuOpen(false);
              }}
              className="relative w-8 h-8 rounded-lg bg-[#F7F7F7] hover:bg-[#E8E8E8] border border-[#E8E8E8] flex items-center justify-center text-[#18181B] transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF5330] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-2xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {isNotificationsOpen && (
              <div
                id="notifications-popover"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E8E8E8] rounded-2xl shadow-xl z-50 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E8]">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-[#18181B]">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FF5330]/10 text-[#FF5330] rounded-full">
                        {unreadCount} non lues
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs font-semibold text-[#FF5330] hover:underline cursor-pointer"
                    >
                      Tout marquer comme lu
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-center text-xs text-[#6F6F73] py-6">Aucune notification.</p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-3 rounded-xl border transition-colors cursor-pointer text-left ${
                          notif.read
                            ? 'bg-[#FAFAFA] border-[#E8E8E8]'
                            : 'bg-[#FF5330]/5 border-[#FF5330]/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-[#18181B] leading-snug">{notif.title}</p>
                          <span className="text-[10px] text-[#A1A1AA] flex-shrink-0">{notif.date}</span>
                        </div>
                        <p className="text-[11px] text-[#6F6F73] mt-1 leading-relaxed">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-[#E8E8E8]">
                  <button
                    onClick={() => {
                      setActiveTab('notifications');
                      setIsNotificationsOpen(false);
                    }}
                    className="w-full text-center text-xs font-bold text-[#18181B] hover:text-[#FF5330] py-1 transition-colors cursor-pointer"
                  >
                    Voir le centre de notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              id="btn-user-menu-toggle"
              onClick={() => {
                setIsProfileMenuOpen(!isProfileMenuOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center space-x-2 p-1.5 sm:px-2 sm:py-1.5 rounded-xl hover:bg-[#F7F7F7] border border-transparent hover:border-[#E8E8E8] transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#18181B] text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-white">
                {userInitials}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#6F6F73] hidden sm:block" />
            </button>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && (
              <div
                id="user-profile-dropdown"
                className="absolute right-0 mt-2 w-56 bg-white border border-[#E8E8E8] rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-2 border-b border-[#E8E8E8] mb-1">
                  <p className="text-xs font-bold text-[#18181B] truncate">{userProfile.name}</p>
                  <p className="text-[11px] text-[#6F6F73] truncate">{userProfile.email}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF5330]/10 text-[#FF5330]">
                    {userProfile.plan}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#52525B] hover:text-[#18181B] hover:bg-[#F7F7F7] transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Mon profil</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('security');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#52525B] hover:text-[#18181B] hover:bg-[#F7F7F7] transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Sécurité & Code PIN</span>
                </button>



                <div className="border-t border-[#E8E8E8] pt-1">
                  <button
                    onClick={() => {
                      lockApp();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Verrouiller l'espace</span>
                  </button>
                </div>

                <div className="border-t border-[#E8E8E8] pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#6F6F73] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
