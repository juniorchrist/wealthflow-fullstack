import React, { useState, useEffect } from 'react';
import {
  Plus,
  Calendar as CalendarIcon,
  Tag,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { AppState, Category, Transaction, TransactionType } from '../types';
import { formatFCFA, getTodayDateString, formatDate } from '../utils/formatters';
import { CategoryIcon } from './ui/CategoryIcon';

interface AddExpenseViewProps {
  state: AppState;
  onSaveTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onNavigateTab: (tab: string) => void;
  onOpenTransactionModal?: (tx?: Transaction) => void;
}

export const AddExpenseView: React.FC<AddExpenseViewProps> = ({
  state,
  onSaveTransaction,
  onNavigateTab,
  onOpenTransactionModal,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableCategories = state.categories.filter(
    (c) => (c.type === type || c.type === 'both') && (c.isActive ?? true)
  );

  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.some((c) => c.id === selectedCatId)) {
      setSelectedCatId(availableCategories[0].id);
    }
  }, [type, availableCategories, selectedCatId]);

  const numericAmount = parseFloat(amountStr) || 0;
  const presets = [1000, 5000, 10000, 25000, 50000];

  const handlePresetAdd = (val: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr((current + val).toString());
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numericAmount <= 0) {
      setError('Veuillez saisir un montant supérieur à 0 FCFA.');
      return;
    }

    if (!selectedCatId) {
      setError('Veuillez sélectionner une catégorie.');
      return;
    }

    onSaveTransaction({
      amount: Math.round(numericAmount),
      type,
      categoryId: selectedCatId,
      date,
      note: note.trim() || undefined,
    });

    setShowSuccess(true);
    setAmountStr('');
    setNote('');
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="wf-page animate-slideUp space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="wf-title-page">
            Nouvelle opération
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--wf-text-secondary)' }}>
            Enregistrement instantané d'un flux financier
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('wealth')}
          className="text-xs font-bold transition-colors touch-target py-2 px-3 rounded-xl"
          style={{ color: 'var(--wf-primary)' }}
        >
          Fermer
        </button>
      </div>

      {showSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2} />
          <span>Opération enregistrée avec succès !</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600" strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Card (Liquid Glass) */}
      <form onSubmit={handleSubmit} className="liquid-card p-5 space-y-4">
        {/* Type Toggle: Dépense vs Revenu */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#FAFAFA] rounded-2xl border border-[#EAE5DC]">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setError(null);
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              type === 'expense'
                ? 'btn-sunset'
                : 'text-[#78716C] hover:text-[#18181B]'
            }`}
          >
            <TrendingDown className="w-4 h-4" strokeWidth={2} />
            <span>Dépense</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setType('income');
              setError(null);
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[#78716C] hover:text-[#18181B]'
            }`}
          >
            <TrendingUp className="w-4 h-4" strokeWidth={2} />
            <span>Revenu</span>
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-[11px] font-bold text-[#635A52] uppercase tracking-wider mb-1.5">
            Montant (FCFA)
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="1"
              value={amountStr}
              onChange={(e) => {
                setAmountStr(e.target.value);
                setError(null);
              }}
              placeholder="0"
              className="w-full pl-4 pr-16 py-3.5 rounded-2xl bg-white/80 border border-[#EAE5DC] text-2xl font-mono font-extrabold tracking-tight text-[#18181B] placeholder-[#B0A79E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF5330]/20 focus:border-[#FF5330] transition-all"
              autoFocus
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#FF5330] pointer-events-none">
              FCFA
            </span>
          </div>

          {/* Quick Presets with Glass chips */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1">
            {presets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handlePresetAdd(val)}
                className="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-[#EAE5DC] hover:border-[#FF5330]/40 text-[10px] font-mono font-bold text-[#635A52] active:scale-95 transition-all cursor-pointer flex-shrink-0 shadow-xs"
              >
                +{formatFCFA(val, { hideCurrency: true, compact: true })}
              </button>
            ))}
          </div>
        </div>

        {/* Category Picker */}
        <div>
          <label className="block text-[11px] font-bold text-[#635A52] uppercase tracking-wider mb-1.5">
            Catégorie
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
            {availableCategories.map((cat) => {
              const isSelected = selectedCatId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCatId(cat.id);
                    setError(null);
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'border-[#FF5330] bg-white ring-2 ring-[#FF5330]/20 shadow-xs'
                      : 'border-[#EAE5DC] bg-white/70 hover:border-[#FF5330]/30'
                  }`}
                >
                  <CategoryIcon category={cat} className="w-7 h-7 rounded-xl flex-shrink-0 shadow-xs" />
                  <span className="text-xs font-bold text-[#18181B] truncate">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date & Note Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-[#635A52] uppercase tracking-wider mb-1.5">
              Date
            </label>
            <div className="relative">
              <CalendarIcon className="w-4 h-4 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/80 border border-[#EAE5DC] text-xs font-medium text-[#18181B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF5330]/20 focus:border-[#FF5330]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#635A52] uppercase tracking-wider mb-1.5">
              Note (optionnel)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: Facture, restaurant..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/80 border border-[#EAE5DC] text-xs font-medium text-[#18181B] placeholder-[#B0A79E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF5330]/20 focus:border-[#FF5330]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-2xl btn-sunset font-bold text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <Plus className="w-4 h-4 stroke-[2.8]" />
          <span>Enregistrer l'opération</span>
        </button>
      </form>
    </div>
  );
};
