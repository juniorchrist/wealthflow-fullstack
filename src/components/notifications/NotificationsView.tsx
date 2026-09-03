import React, { useState } from 'react';
import { AlertTriangle, Bell, CheckCircle2, Info, Sparkles, Trash2 } from 'lucide-react';
import { useWealth } from '../../context/WealthContext';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } = useWealth();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-[#10B981]" />;
      case 'warning':
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-[#F97316]" />;
      default:
        return <Info className="w-5 h-5 text-[#FF5330]" />;
    }
  };

  return (
    <div id="notifications-view" className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#18181B] tracking-tight">
            Centre de Notifications
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6F73] mt-0.5">
            Suivi des alertes budgétaires, jalons d’épargne et conseils de sécurité
          </p>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-[#E8E8E8] text-xs font-bold text-[#18181B] hover:border-[#FF5330] hover:text-[#FF5330] transition-colors cursor-pointer self-start sm:self-auto"
        >
          Tout marquer comme lu
        </button>
      </div>

      {/* 2. Filters */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-[#18181B] text-white shadow-sm'
              : 'bg-white border border-[#E8E8E8] text-[#6F6F73] hover:text-[#18181B]'
          }`}
        >
          Toutes ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'unread'
              ? 'bg-[#18181B] text-white shadow-sm'
              : 'bg-white border border-[#E8E8E8] text-[#6F6F73] hover:text-[#18181B]'
          }`}
        >
          Non lues ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* 3. Notifications List */}
      <div className="rounded-xl bg-white border border-[#E8E8E8] shadow-2xs divide-y divide-[#F0F0F0] overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center space-y-1.5">
            <Bell className="w-6 h-6 text-[#A1A1AA] mx-auto" />
            <p className="font-bold text-xs sm:text-sm text-[#18181B]">Vous êtes à jour !</p>
            <p className="text-[11px] text-[#6F6F73]">Aucune notification non lue pour le moment.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 sm:p-3.5 flex items-start justify-between gap-3 transition-colors ${
                notif.read ? 'bg-white' : 'bg-[#FFFBF9]'
              }`}
            >
              <div className="flex items-start space-x-3 min-w-0">
                <div className="p-1.5 rounded-lg bg-white border border-[#E8E8E8] shadow-2xs mt-0.5 flex-shrink-0">
                  {getNotifIcon(notif.type)}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <h4 className="font-bold text-xs sm:text-sm text-[#18181B]">{notif.title}</h4>
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5330] flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#52525B] leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] font-medium text-[#A1A1AA] block">{notif.date}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {!notif.read && (
                  <button
                    onClick={() => markNotificationAsRead(notif.id)}
                    className="text-xs font-bold text-[#FF5330] hover:underline cursor-pointer"
                  >
                    Marquer lu
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif.id)}
                  className="p-1.5 text-[#A1A1AA] hover:text-[#EF4444] rounded-lg transition-colors cursor-pointer"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
