import React from 'react';
import { TrendingDown, TrendingUp, ArrowRightLeft, PiggyBank } from 'lucide-react';
import { MobileBottomSheet } from './MobileBottomSheet';

interface AddActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'expense' | 'income' | 'transfer' | 'savings') => void;
}

interface ActionItem {
  id: 'expense' | 'income' | 'transfer' | 'savings';
  label: string;
  Icon: React.FC<{ size?: number; className?: string }>;
  color: string;
  background: string;
}

const actions: ActionItem[] = [
  {
    id: 'expense',
    label: 'Dépense',
    Icon: TrendingDown,
    color: 'var(--wf-danger)',
    background: 'var(--wf-danger-soft)',
  },
  {
    id: 'income',
    label: 'Revenu',
    Icon: TrendingUp,
    color: 'var(--wf-success)',
    background: 'var(--wf-success-soft)',
  },
  {
    id: 'transfer',
    label: 'Virement',
    Icon: ArrowRightLeft,
    color: 'var(--wf-text)',
    background: 'var(--wf-surface-soft)',
  },
  {
    id: 'savings',
    label: 'Épargne',
    Icon: PiggyBank,
    color: 'var(--wf-primary)',
    background: 'var(--wf-primary-soft)',
  },
];

export const AddActionMenu: React.FC<AddActionMenuProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter une opération"
    >
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.Icon;
          return (
            <button
              key={action.id}
              onClick={() => {
                onSelectAction(action.id);
                onClose();
              }}
              className="liquid-card p-5 flex flex-col items-center justify-center gap-2.5 transition-all active:scale-95 touch-target"
              style={{ minHeight: '110px' }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: action.background, color: action.color }}
              >
                <Icon size={22} />
              </div>
              <span className="text-xs font-semibold" style={{ color: 'var(--wf-text)' }}>
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </MobileBottomSheet>
  );
};