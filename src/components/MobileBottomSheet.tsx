import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="mobile-bottom-sheet-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="mobile-bottom-sheet mobile-only animate-sheetIn"
        role="dialog"
        aria-modal="true"
      >
        {/* Handle */}
        <div className="mobile-bottom-sheet-handle" />

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: 'var(--wf-border)' }}>
            <h2 className="wf-title-section text-base sm:text-lg">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="touch-target rounded-xl transition-colors"
              style={{ color: 'var(--wf-text-tertiary)' }}
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content */}
        <div>{children}</div>
      </div>
    </>
  );
};