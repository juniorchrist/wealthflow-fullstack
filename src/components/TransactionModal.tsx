import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText } from 'lucide-react';
import { AppState, Category, Transaction, TransactionType } from '../types';
import { formatFCFA, getTodayDateString } from '../utils/formatters';
import { CategoryIcon } from './ui/CategoryIcon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  state?: AppState;
  categories?: Category[];
  editingTransaction?: Transaction | null;
  initialTransaction?: Transaction | null;
  currentMonthBudget?: number;
  currentMonthSpent?: number;
  currentMonthKey?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  state,
  categories: propCategories,
  editingTransaction,
  initialTransaction,
}) => {
  const effectiveCategories = propCategories || state?.categories || [];
  const currentEditingTx = editingTransaction || initialTransaction;

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (currentEditingTx) {
      setType(currentEditingTx.type);
      setAmount(currentEditingTx.amount.toString());
      setCategoryId(currentEditingTx.categoryId);
      setDate(currentEditingTx.date);
      setNote(currentEditingTx.note || '');
    } else {
      setType('expense');
      setAmount('');
      setDate(getTodayDateString());
      setNote('');
      const defaultCat = effectiveCategories.find((c) => c.type === 'expense' || c.type === 'both');
      setCategoryId(defaultCat ? defaultCat.id : effectiveCategories[0]?.id || '');
    }
    setError('');
  }, [currentEditingTx, isOpen, effectiveCategories]);

  const filteredCategories = effectiveCategories.filter(
    (c) => (c.type === type || c.type === 'both') && (c.isActive ?? true)
  );

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const valid = effectiveCategories.filter(
      (c) => (c.type === newType || c.type === 'both') && (c.isActive ?? true)
    );
    if (!valid.some((c) => c.id === categoryId)) {
      setCategoryId(valid[0]?.id || '');
    }
  };

  const numericAmount = parseFloat(amount) || 0;
  const quickAmounts = [1000, 5000, 10000, 25000];

  const handleAddQuickAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numericAmount || numericAmount <= 0) {
      setError('Veuillez saisir un montant supérieur à 0 FCFA.');
      return;
    }
    if (!categoryId) {
      setError('Veuillez sélectionner une catégorie.');
      return;
    }
    if (!date) {
      setError('Veuillez choisir une date.');
      return;
    }

    onSave(
      {
        amount: Math.round(numericAmount),
        type,
        categoryId,
        date,
        note: note.trim() || undefined,
      },
      currentEditingTx ? currentEditingTx.id : undefined
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="wf-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="wf-modal-card animate-sheetIn sm:animate-modalIn">
        {/* Mobile drag handle */}
        <div className="mobile-bottom-sheet-handle sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: 'var(--wf-border)' }}>
          <div>
            <h2 className="wf-title-section text-base sm:text-lg">
              {currentEditingTx ? "Modifier l'opération" : 'Nouvelle opération'}
            </h2>
            <span className="text-xs" style={{ color: 'var(--wf-text-tertiary)' }}>Devise : FCFA</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl transition-colors touch-target"
            style={{ color: 'var(--wf-text-tertiary)' }}
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div
            className="grid grid-cols-2 gap-1.5 p-1 rounded-xl"
            style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}
          >
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className="py-2 rounded-lg text-xs font-bold transition-all touch-target"
              style={{
                background: type === 'expense' ? 'var(--wf-primary)' : 'transparent',
                color: type === 'expense' ? 'white' : 'var(--wf-text-secondary)',
              }}
            >
              Dépense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className="py-2 rounded-lg text-xs font-bold transition-all touch-target"
              style={{
                background: type === 'income' ? 'var(--wf-success)' : 'transparent',
                color: type === 'income' ? 'white' : 'var(--wf-text-secondary)',
              }}
            >
              Revenu
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label className="wf-label text-xs">
              Montant (FCFA)
            </label>
            <div className="relative flex items-center">
              <input
                id="tx-amount-input"
                type="number"
                inputMode="numeric"
                step="1"
                min="1"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="0"
                className="wf-input font-bold text-lg tabular-nums pr-14"
                autoFocus
              />
              <span
                className="absolute right-4 text-xs font-bold"
                style={{ color: 'var(--wf-primary)' }}
              >
                FCFA
              </span>
            </div>

            {/* Quick Steppers */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddQuickAmount(val)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors tabular-nums touch-target"
                  style={{
                    background: 'var(--wf-surface-soft)',
                    border: '1px solid var(--wf-border)',
                    color: 'var(--wf-text-secondary)',
                  }}
                >
                  +{formatFCFA(val, { hideCurrency: true })}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="wf-label text-xs">
              Catégorie
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {filteredCategories.map((c) => {
                const isSelected = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(c.id);
                      setError('');
                    }}
                    className="p-2 rounded-xl border text-left flex items-center gap-2 text-xs font-semibold transition-all touch-target"
                    style={{
                      background: isSelected ? 'var(--wf-primary)' : 'var(--wf-surface-soft)',
                      borderColor: isSelected ? 'var(--wf-primary)' : 'var(--wf-border)',
                      color: isSelected ? 'white' : 'var(--wf-text)',
                    }}
                  >
                    <CategoryIcon
                      category={c}
                      className="w-4 h-4 flex-shrink-0"
                    />
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="wf-label text-xs">Date</label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--wf-text-tertiary)' }} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="wf-input pl-9 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="wf-label text-xs">Note</label>
              <div className="relative">
                <FileText size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--wf-text-tertiary)' }} />
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Facultatif"
                  className="wf-input pl-9 text-xs"
                />
              </div>
            </div>
          </div>

          {error && (
            <div
              className="p-3 rounded-xl text-xs font-semibold border"
              style={{
                background: 'var(--wf-danger-soft)',
                color: 'var(--wf-danger)',
                borderColor: 'rgba(211,47,47,0.2)',
              }}
            >
              {error}
            </div>
          )}

          <div className="flex gap-2.5 pt-3 border-t" style={{ borderColor: 'var(--wf-border)' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-bold btn-ghost touch-target"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-xs font-bold btn-primary touch-target"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
