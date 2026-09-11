import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = 'max-h-[85vh]',
}) => {
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when open
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Container */}
      <div
        id="bottom-sheet-panel"
        className={`relative z-10 w-full bg-white rounded-t-[28px] border-t border-[#E8E8E8] shadow-2xl flex flex-col ${maxHeight} animate-in slide-in-from-bottom duration-250 pb-[max(1.25rem,env(safe-area-inset-bottom))]`}
      >
        {/* Handle Bar */}
        <div className="w-full pt-3 pb-1.5 flex justify-center items-center cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1.25 bg-[#D4D4D8] rounded-full" />
        </div>

        {/* Header if title is present - Compact version */}
        {(title || subtitle) && (
          <div className="px-4 py-2 flex items-center justify-between border-b border-[#F0F0F0]">
            <div className="min-w-0 pr-2">
              {title && <h3 className="font-extrabold text-sm sm:text-base text-[#18181B] truncate">{title}</h3>}
              {subtitle && <p className="text-[11px] text-[#6F6F73] mt-0.5 truncate">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#6F6F73] transition-colors cursor-pointer flex-shrink-0"
              aria-label="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Content - Reduced padding for compact cards */}
        <div className="px-4 py-2 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
