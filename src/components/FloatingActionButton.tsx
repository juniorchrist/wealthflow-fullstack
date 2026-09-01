import React from 'react';
import { Plus, X } from 'lucide-react';

interface FloatingActionButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  ariaLabel?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  isOpen,
  onToggle,
  ariaLabel = 'Ajouter une opération',
}) => {
  return (
    <button
      onClick={onToggle}
      className="mobile-fab mobile-only"
      style={{
        position: 'fixed',
        bottom: 'calc(72px + env(safe-area-inset-bottom))',
        right: 'max(16px, env(safe-area-inset-right))',
        zIndex: 'var(--wf-z-fab)',
        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease',
      }}
      aria-label={isOpen ? 'Fermer' : ariaLabel}
      title={isOpen ? 'Fermer' : ariaLabel}
    >
      {isOpen ? <X size={22} strokeWidth={2.5} /> : <Plus size={22} strokeWidth={2.5} />}
    </button>
  );
};