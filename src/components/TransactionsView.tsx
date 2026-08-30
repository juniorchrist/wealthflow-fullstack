import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { AppState, Transaction } from '../types';
import { formatFCFA, formatDate } from '../utils/formatters';
import { CategoryIcon } from './ui/CategoryIcon';

interface TransactionsViewProps {
  state: AppState;
  currentMonthKey?: string;
  onOpenTransactionModal: (tx?: Transaction) => void;
  onRequestDeleteTx: (tx: Transaction) => void;
  onExportCSV: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  state,
  currentMonthKey,
  onOpenTransactionModal,
  onRequestDeleteTx,
  onExportCSV,
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');

  const filtered = state.transactions.filter((tx) => {
    if (selectedType !== 'all' && tx.type !== selectedType) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const cat = state.categories.find((c) => c.id === tx.categoryId);
      const matchNote = tx.note?.toLowerCase().includes(q);
      const matchCat = cat?.name.toLowerCase().includes(q);
      const matchAmount = tx.amount.toString().includes(q);
      if (!matchNote && !matchCat && !matchAmount) {
        return false;
      }
    }
    return true;
  });

  const totalExpense = filtered
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalIncome = filtered
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="wf-page animate-slideUp">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="wf-title-page">Journal des flux</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--wf-text-secondary)' }}>
            {filtered.length} opération{filtered.length > 1 ? 's' : ''} enregistrée{filtered.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold btn-ghost flex items-center gap-1.5 touch-target"
            title="Exporter en CSV"
          >
            <Download size={14} />
            <span>Exporter</span>
          </button>
          <button
            onClick={() => onOpenTransactionModal()}
            className="px-4 py-2 rounded-xl text-xs font-semibold btn-primary flex items-center gap-1.5 touch-target"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="liquid-card p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--wf-success-soft)' }}
            >
              <TrendingUp size={14} style={{ color: 'var(--wf-success)' }} />
            </div>
            <p className="text-xs font-medium" style={{ color: 'var(--wf-text-tertiary)' }}>
              Entrées
            </p>
          </div>
          <p className="wf-amount-medium" style={{ color: 'var(--wf-success)' }}>
            +{formatFCFA(totalIncome)}
          </p>
        </div>

        <div className="liquid-card p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--wf-danger-soft)' }}
            >
              <TrendingDown size={14} style={{ color: 'var(--wf-danger)' }} />
            </div>
            <p className="text-xs font-medium" style={{ color: 'var(--wf-text-tertiary)' }}>
              Dépenses
            </p>
          </div>
          <p className="wf-amount-medium" style={{ color: 'var(--wf-text)' }}>
            −{formatFCFA(totalExpense)}
          </p>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--wf-text-tertiary)' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une opération, catégorie, montant..."
            className="wf-input wf-input-with-icon pr-4 text-xs"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedType('all')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 touch-target"
            style={{
              background: selectedType === 'all' ? 'var(--wf-primary)' : 'var(--wf-surface-soft)',
              color: selectedType === 'all' ? 'white' : 'var(--wf-text-secondary)',
              border: selectedType === 'all' ? 'none' : '1px solid var(--wf-border)',
            }}
          >
            Tous ({state.transactions.length})
          </button>
          <button
            onClick={() => setSelectedType('expense')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 touch-target"
            style={{
              background: selectedType === 'expense' ? 'var(--wf-primary)' : 'var(--wf-surface-soft)',
              color: selectedType === 'expense' ? 'white' : 'var(--wf-text-secondary)',
              border: selectedType === 'expense' ? 'none' : '1px solid var(--wf-border)',
            }}
          >
            Dépenses
          </button>
          <button
            onClick={() => setSelectedType('income')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 touch-target"
            style={{
              background: selectedType === 'income' ? 'var(--wf-success)' : 'var(--wf-surface-soft)',
              color: selectedType === 'income' ? 'white' : 'var(--wf-text-secondary)',
              border: selectedType === 'income' ? 'none' : '1px solid var(--wf-border)',
            }}
          >
            Revenus
          </button>
        </div>
      </div>

      {/* Transactions List */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((tx) => {
            const category = state.categories.find((c) => c.id === tx.categoryId);
            return (
              <div
                key={tx.id}
                className="liquid-card p-3.5 sm:p-4 flex items-center justify-between gap-3 group transition-colors"
              >
                <div
                  onClick={() => onOpenTransactionModal(tx)}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--wf-surface-soft)' }}
                  >
                    <CategoryIcon category={category} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--wf-text)' }}>
                      {tx.note || category?.name || 'Sans intitulé'}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--wf-text-tertiary)' }}>
                      {formatDate(tx.date)} • {category?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span
                    className="text-sm sm:text-base font-bold tabular-nums"
                    style={{
                      color: tx.type === 'income' ? 'var(--wf-success)' : 'var(--wf-text)',
                    }}
                  >
                    {tx.type === 'income' ? '+' : '−'}
                    {formatFCFA(tx.amount)}
                  </span>

                  <button
                    type="button"
                    onClick={() => onRequestDeleteTx(tx)}
                    className="p-2 rounded-lg transition-colors opacity-70 sm:opacity-0 sm:group-hover:opacity-100 touch-target"
                    style={{ color: 'var(--wf-text-tertiary)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--wf-danger)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--wf-text-tertiary)')}
                    title="Supprimer la transaction"
                    aria-label="Supprimer la transaction"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="liquid-card p-10 text-center">
          <Search size={32} className="mx-auto mb-3" style={{ color: 'var(--wf-text-tertiary)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--wf-text-secondary)' }}>
            Aucune opération correspondant aux filtres
          </p>
          <button
            onClick={() => onOpenTransactionModal()}
            className="btn-primary mt-4 px-5 py-2.5 text-xs font-semibold"
          >
            Créer une opération
          </button>
        </div>
      )}
    </div>
  );
};