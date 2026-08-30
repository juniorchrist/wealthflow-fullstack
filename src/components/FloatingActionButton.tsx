import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  ariaLabel?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  ariaLabel = 'Ajouter une opération',
}) => {
  return (
    <button
      onClick={onClick}
      className="mobile-fab mobile-only"
      style={{
        position: 'fixed',
        bottom: 'calc(72px + env(safe-area-inset-bottom))',
        right: 'max(16px, env(safe-area-inset-right))',
        zIndex: 'var(--wf-z-fab)',
      }}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <Plus size={22} strokeWidth={2.5} />
    </button>
  );
};