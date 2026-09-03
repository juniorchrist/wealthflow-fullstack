import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpDown,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical,
  Pencil,
  PiggyBank,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { Transaction, TransactionType } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { BottomSheet } from '../common/BottomSheet';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    categories,
    deleteTransaction,
    formatCurrency,
    setIsNewTransactionModalOpen,
    totalIncome,
    totalExpenses,
    totalSaved,
  } = useWealth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [selectedTxDetails, setSelectedTxDetails] = useState<Transaction | null>(null);

  const itemsPerPage = 10;

  // Filter accounts list dynamically
  const uniqueAccounts = useMemo(() => {
    const set = new Set(transactions.map((t) => t.account));
    return Array.from(set);
  }, [transactions]);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchesQuery =
          tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.account.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === 'all' ||
          tx.categoryId === selectedCategory ||
          tx.category === selectedCategory;
        const matchesAccount = selectedAccount === 'all' || tx.account === selectedAccount;
        const matchesType = selectedType === 'all' || tx.type === selectedType;

        return matchesQuery && matchesCategory && matchesAccount && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchQuery, selectedCategory, selectedAccount, selectedType, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedAccount !== 'all' ? 1 : 0) +
    (sortBy !== 'date_desc' ? 1 : 0);

  return (
    <div id="transactions-view" className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      
      {/* 1. Header & Quick Stat Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
            Activité & Journal des Flux
          </h2>
          <p className="text-xs text-[#6F6F73] mt-0.5">
            Historique complet de vos dépenses, revenus et versements
          </p>
        </div>

        <button
          onClick={() => setIsNewTransactionModalOpen(true)}
          className="hidden sm:inline-flex items-center space-x-2 py-2 px-3.5 rounded-xl bg-[#FF5330] hover:bg-[#E84524] active:scale-95 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nouvelle transaction</span>
        </button>
      </div>

      {/* 2. Compact Top Stats Strip */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-0.5">
          <p className="text-[10px] font-semibold text-[#6F6F73]">Revenus</p>
          <p className="text-xs sm:text-sm font-black text-[#10B981] num-tabular truncate">
            +{formatCurrency(totalIncome)}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-0.5">
          <p className="text-[10px] font-semibold text-[#6F6F73]">Dépenses</p>
          <p className="text-xs sm:text-sm font-black text-[#EF4444] num-tabular truncate">
            -{formatCurrency(totalExpenses)}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-0.5">
          <p className="text-[10px] font-semibold text-[#6F6F73]">Épargne</p>
          <p className="text-xs sm:text-sm font-black text-[#FF5330] num-tabular truncate">
            {formatCurrency(totalSaved)}
          </p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une opération, catégorie, compte..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9.5 pr-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-xs font-semibold text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#FF5330] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#18181B]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Advanced Filters Button (Opens Bottom Sheet) */}
          <button
            onClick={() => setIsFilterSheetOpen(true)}
            className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer relative ${
              activeFiltersCount > 0
                ? 'bg-[#FF5330]/10 border-[#FF5330] text-[#FF5330]'
                : 'bg-white border-[#E8E8E8] text-[#18181B] hover:bg-[#F7F7F7]'
            }`}
            title="Filtres avancés"
            aria-label="Filtres avancés"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF5330] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Type Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              setSelectedType('all');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedType === 'all'
                ? 'bg-[#18181B] text-white shadow-xs'
                : 'bg-white border border-[#E8E8E8] text-[#6F6F73] hover:text-[#18181B]'
            }`}
          >
            Tous ({transactions.length})
          </button>

          <button
            onClick={() => {
              setSelectedType('expense');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedType === 'expense'
                ? 'bg-[#EF4444] text-white shadow-xs'
                : 'bg-white border border-[#E8E8E8] text-[#6F6F73] hover:text-[#EF4444]'
            }`}
          >
            Dépenses
          </button>

          <button
            onClick={() => {
              setSelectedType('income');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedType === 'income'
                ? 'bg-[#10B981] text-white shadow-xs'
                : 'bg-white border border-[#E8E8E8] text-[#6F6F73] hover:text-[#10B981]'
            }`}
          >
            Revenus
          </button>

          <button
            onClick={() => {
              setSelectedType('savings_deposit');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedType === 'savings_deposit'
                ? 'bg-[#FF5330] text-white shadow-xs'
                : 'bg-white border border-[#E8E8E8] text-[#6F6F73] hover:text-[#FF5330]'
            }`}
          >
            Épargne
          </button>
        </div>
      </div>

      {/* 4. Transactions List (Tactile & Clean) */}
      <div className="rounded-2xl bg-white border border-[#E8E8E8] shadow-2xs divide-y divide-[#F0F0F0] overflow-hidden">
        {paginatedTransactions.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="font-bold text-sm text-[#18181B]">Aucune transaction trouvée.</p>
            <p className="text-xs text-[#6F6F73]">
              Modifiez vos critères de recherche ou ajoutez une nouvelle opération.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedCategory('all');
                setSelectedAccount('all');
              }}
              className="mt-2 text-xs font-bold text-[#FF5330] hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          paginatedTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const isSavings = tx.type === 'savings_deposit';

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTxDetails(tx)}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#FAFAFA] active:bg-[#F4F4F5] transition-colors cursor-pointer"
              >
                  <div className="flex items-center space-x-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isIncome
                        ? 'bg-[#10B981]/10 text-[#10B981]'
                        : isSavings
                        ? 'bg-[#FF5330]/10 text-[#FF5330]'
                        : 'bg-[#F7F7F7] text-[#18181B]'
                    }`}
                  >
                    <CategoryIcon name={tx.category} className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-[#18181B] truncate">{tx.title}</p>
                    <p className="text-[11px] text-[#6F6F73] truncate mt-0.5">
                      {tx.category} • {tx.account}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-xs sm:text-sm font-black num-tabular ${
                      isIncome
                        ? 'text-[#10B981]'
                        : isSavings
                        ? 'text-[#FF5330]'
                        : 'text-[#18181B]'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </p>
                  <span className="text-[10px] text-[#A1A1AA]">{tx.date}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-[#6F6F73]">
            Page <span className="font-bold text-[#18181B]">{currentPage}</span> sur {totalPages}
          </p>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white border border-[#E8E8E8] text-[#18181B] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F7F7] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white border border-[#E8E8E8] text-[#18181B] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F7F7] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 6. Advanced Filters Bottom Sheet */}
      <BottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="Filtrer et Trier"
        subtitle="Ajustez les options d'affichage de vos transactions"
      >
        <div className="space-y-4 py-1">
          {/* Tri */}
          <div>
            <label className="text-xs font-bold text-[#18181B] block mb-1.5">Trier par</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-xs font-semibold text-[#18181B]"
            >
              <option value="date_desc">Date (les plus récentes d'abord)</option>
              <option value="date_asc">Date (les plus anciennes d'abord)</option>
              <option value="amount_desc">Montant (les plus élevés)</option>
              <option value="amount_asc">Montant (les plus faibles)</option>
            </select>
          </div>

          {/* Catégories */}
          <div>
            <label className="text-xs font-bold text-[#18181B] block mb-1.5">Catégorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-xs font-semibold text-[#18181B]"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Comptes */}
          <div>
            <label className="text-xs font-bold text-[#18181B] block mb-1.5">Compte d'origine</label>
            <select
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-xs font-semibold text-[#18181B]"
            >
              <option value="all">Tous les comptes</option>
              {uniqueAccounts.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedAccount('all');
                setSortBy('date_desc');
                setIsFilterSheetOpen(false);
              }}
              className="flex-1 py-2.5 rounded-xl border border-[#E8E8E8] text-xs font-bold text-[#6F6F73] hover:text-[#18181B]"
            >
              Réinitialiser
            </button>
            <button
              onClick={() => setIsFilterSheetOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-[#FF5330] text-white text-xs font-bold shadow-xs"
            >
              Appliquer
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* 7. Transaction Details Bottom Sheet */}
      <BottomSheet
        isOpen={Boolean(selectedTxDetails)}
        onClose={() => setSelectedTxDetails(null)}
        title="Détails de la transaction"
        subtitle={selectedTxDetails?.title}
      >
        {selectedTxDetails && (
          <div className="space-y-4 py-1">
            {/* Amount Banner */}
            <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#E8E8E8] text-center space-y-1">
              <p className="text-xs text-[#6F6F73]">Montant enregistré</p>
              <p
                className={`text-2xl sm:text-3xl font-black num-tabular ${
                  selectedTxDetails.type === 'income'
                    ? 'text-[#10B981]'
                    : selectedTxDetails.type === 'savings_deposit'
                    ? 'text-[#FF5330]'
                    : 'text-[#18181B]'
                }`}
              >
                {selectedTxDetails.type === 'income' ? '+' : '-'}
                {formatCurrency(selectedTxDetails.amount)}
              </p>
            </div>

            {/* Info Grid */}
            <div className="space-y-2 text-xs divide-y divide-[#F0F0F0]">
              <div className="flex justify-between py-2">
                <span className="text-[#6F6F73]">Catégorie</span>
                <span className="font-bold text-[#18181B]">{selectedTxDetails.category}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#6F6F73]">Compte / Mode</span>
                <span className="font-bold text-[#18181B]">{selectedTxDetails.account}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#6F6F73]">Date</span>
                <span className="font-bold text-[#18181B]">{selectedTxDetails.date}</span>
              </div>
              {selectedTxDetails.notes && (
                <div className="py-2">
                  <span className="text-[#6F6F73] block mb-1">Notes</span>
                  <p className="p-2.5 rounded-xl bg-[#F7F7F7] text-[#18181B] italic">
                    {selectedTxDetails.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Delete CTA */}
            <div className="pt-2">
              <button
                onClick={() => {
                  deleteTransaction(selectedTxDetails.id);
                  setSelectedTxDetails(null);
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#EF4444] font-bold text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer cette opération</span>
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

    </div>
  );
};
