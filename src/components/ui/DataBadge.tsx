import React from 'react';
import { DataTypeTag } from '../../types';

interface DataBadgeProps {
  type: DataTypeTag;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const DataBadge: React.FC<DataBadgeProps> = ({
  type,
  size = 'sm',
  className = '',
}) => {
  const configs: Record<DataTypeTag, { label: string; bg: string; text: string; border: string }> = {
    real: {
      label: 'Saisie réelle',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
    },
    calculated: {
      label: 'Calculé',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
    },
    estimate: {
      label: 'Projection',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200',
    },
  };

  const config = configs[type];
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span
      id={`data-badge-${type}`}
      className={`inline-flex items-center font-bold rounded-full tracking-tight ${config.bg} ${config.text} ${config.border} border ${sizeClasses} ${className}`}
    >
      {config.label}
    </span>
  );
};

