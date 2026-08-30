import React from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  TrendingUp,
  Info,
} from 'lucide-react';
import { AppNotification, AppState, MonthSummary } from '../types';
import { formatFCFA } from '../utils/formatters';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state?: AppState;
  summary?: MonthSummary;
  onNavigateTab?: (tab: string) => void;
  notifications?: AppNotification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
}

function notifIcon(type: AppNotification['type']) {
  switch (type) {
    case 'budget':
      return Wallet;
    case 'transaction':
      return ArrowLeftRight;
    case 'savings':
      return PiggyBank;
    case 'strategy':
      return TrendingUp;
    default:
      return Info;
  }
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

function defaultNotifications(): AppNotification[] {
  return [
    {
      id: 'notif-empty-guide',
      type: 'system',
      title: 'Aucune alerte pour le moment',
      message:
        'Les notifications apparaîtront ici automatiquement dès que vos données changent (budget, dépenses, épargne, stratégie).',
      createdAt: Date.now(),
      read: false,
    },
  ];
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const list: AppNotification[] =
    notifications && notifications.length > 0
      ? notifications.slice().sort((a, b) => b.createdAt - a.createdAt)
      : defaultNotifications();

  const unread = notifications?.filter((n) => !n.read).length || 0;
  const isEmpty = notifications && notifications.length === 0;

  return (
    <div
      className="wf-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="wf-modal-card animate-sheetIn sm:animate-modalIn space-y-4">
        {/* Mobile handle */}
        <div className="mobile-bottom-sheet-handle sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--wf-border)' }}>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell size={18} style={{ color: 'var(--wf-primary)' }} />
              {unread > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                  style={{ background: 'var(--wf-primary)' }}
                />
              )}
            </div>
            <h2 className="wf-title-section text-base">Notifications</h2>
          </div>
          <div className="flex items-center gap-1">
            {!isEmpty && onMarkAllRead && (
              <button
                onClick={onMarkAllRead}
                className="touch-target rounded-xl transition-colors"
                style={{ color: 'var(--wf-text-tertiary)' }}
                title="Tout marquer comme lu"
                aria-label="Tout marquer comme lu"
              >
                <CheckCheck size={17} />
              </button>
            )}
            <button
              onClick={onClose}
              className="touch-target rounded-xl transition-colors"
              style={{ color: 'var(--wf-text-tertiary)' }}
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {list.map((n, idx) => {
            const Icon = notifIcon(n.type);
            const isGuide = n.id === 'notif-empty-guide';
            return (
              <div
                key={n.id || idx}
                className="p-3.5 rounded-xl transition-all flex items-start gap-3"
                style={{
                  background: n.read ? 'var(--wf-surface-soft)' : 'var(--wf-surface)',
                  border: `1px solid ${n.read ? 'var(--wf-border)' : 'rgba(255,83,48,0.25)'}`,
                  boxShadow: n.read ? 'none' : 'var(--wf-shadow-soft)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: n.read ? 'var(--wf-surface-soft)' : 'var(--wf-primary-soft)',
                    color: n.read ? 'var(--wf-text-tertiary)' : 'var(--wf-primary)',
                  }}
                >
                  <Icon size={16} />
                </div>
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    if (isGuide) return;
                    if (!n.read && onMarkRead) onMarkRead(n.id);
                    if (n.tab && onNavigateTab) {
                      onNavigateTab(n.tab);
                      onClose();
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-0.5 gap-2">
                    <h3
                      className="text-xs font-bold truncate"
                      style={{ color: n.read ? 'var(--wf-text-secondary)' : 'var(--wf-text)' }}
                    >
                      {n.title}
                    </h3>
                    <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--wf-text-tertiary)' }}>
                      {relativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--wf-text-secondary)' }}>
                    {n.message}
                  </p>
                  {n.amount ? (
                    <span
                      className="text-xs font-bold tabular-nums mt-1 inline-block"
                      style={{ color: 'var(--wf-primary)' }}
                    >
                      {formatFCFA(n.amount)}
                    </span>
                  ) : null}
                  {n.source && (
                    <p
                      className="text-[10px] italic mt-1"
                      style={{ color: 'var(--wf-text-tertiary)' }}
                    >
                      Pourquoi : {n.source}
                    </p>
                  )}
                </div>

                {!isGuide && onDelete && (
                  <button
                    onClick={() => onDelete(n.id)}
                    className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity touch-target flex-shrink-0"
                    style={{ color: 'var(--wf-text-tertiary)' }}
                    title="Supprimer"
                    aria-label="Supprimer la notification"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}

          {!isEmpty && list.length === 0 && (
            <div className="liquid-card p-6 text-center">
              <Bell size={28} className="mx-auto mb-2" style={{ color: 'var(--wf-text-tertiary)' }} />
              <p className="text-xs" style={{ color: 'var(--wf-text-tertiary)' }}>
                Aucune notification
              </p>
            </div>
          )}
        </div>

        <div className="pt-2 border-t flex gap-2" style={{ borderColor: 'var(--wf-border)' }}>
          {!isEmpty && onClearAll && (
            <button
              onClick={onClearAll}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold btn-ghost flex items-center justify-center gap-1.5 touch-target"
            >
              <Trash2 size={13} />
              <span>Tout effacer</span>
            </button>
          )}
          <button
            onClick={onClose}
            className={isEmpty ? 'w-full py-2.5 rounded-xl text-xs font-semibold btn-ghost touch-target' : 'flex-1 py-2.5 rounded-xl text-xs font-semibold btn-ghost touch-target'}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
