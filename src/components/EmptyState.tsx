import React from 'react';
import { LucideIcon, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  iconColor?: string;
  iconBg?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  iconColor = 'var(--wf-primary)',
  iconBg = 'rgba(255, 83, 48, 0.1)',
}) => {
  return (
    <div
      className="liquid-card p-8 md:p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-6 animate-fadeIn"
      style={{
        border: '1px dashed var(--wf-border-strong)',
        background: 'linear-gradient(180deg, var(--wf-surface) 0%, rgba(240, 235, 225, 0.3) 100%)',
      }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
        style={{ background: iconBg }}
      >
        <Icon size={28} style={{ color: iconColor }} strokeWidth={2} />
      </div>

      <h3 className="text-base md:text-lg font-bold mb-2" style={{ color: 'var(--wf-text)' }}>
        {title}
      </h3>

      <p className="text-xs md:text-sm mb-6 leading-relaxed" style={{ color: 'var(--wf-text-secondary)' }}>
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="wf-btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95"
        >
          <Plus size={16} strokeWidth={2.5} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
