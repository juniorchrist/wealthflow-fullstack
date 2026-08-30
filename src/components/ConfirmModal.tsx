import React from 'react';
import { AlertTriangle, Trash2, Edit3 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  icon?: 'trash' | 'warning' | 'edit';
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  icon = 'warning',
  onConfirm,
  onCancel,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    if (onClose) onClose();
    else if (onCancel) onCancel();
  };

  const getIcon = () => {
    switch (icon) {
      case 'trash':
        return <Trash2 size={22} style={{ color: 'var(--wf-danger)' }} />;
      case 'edit':
        return <Edit3 size={22} style={{ color: 'var(--wf-primary)' }} />;
      default:
        return <AlertTriangle size={22} style={{ color: 'var(--wf-warning)' }} />;
    }
  };

  const getConfirmBtnStyle = () => {
    switch (variant) {
      case 'danger':
        return {
          background: 'var(--wf-danger)',
          color: 'white',
        };
      case 'warning':
        return {
          background: 'var(--wf-warning)',
          color: 'white',
        };
      default:
        return {
          background: 'var(--wf-primary)',
          color: 'white',
        };
    }
  };

  return (
    <div
      className="wf-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="wf-modal-card animate-sheetIn sm:animate-modalIn">
        {/* Mobile handle */}
        <div className="mobile-bottom-sheet-handle sm:hidden" />

        <div className="flex items-start gap-3.5 pt-1">
          <div
            className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center border"
            style={{
              background: 'var(--wf-surface-soft)',
              borderColor: 'var(--wf-border)',
            }}
          >
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--wf-text)' }}>
              {title}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--wf-text-secondary)' }}>
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t" style={{ borderColor: 'var(--wf-border)' }}>
          <button
            id="confirm-modal-cancel-btn"
            type="button"
            onClick={handleClose}
            className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold btn-ghost touch-target"
          >
            {cancelLabel}
          </button>
          <button
            id="confirm-modal-confirm-btn"
            type="button"
            onClick={() => {
              onConfirm();
              handleClose();
            }}
            className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm touch-target"
            style={getConfirmBtnStyle()}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
