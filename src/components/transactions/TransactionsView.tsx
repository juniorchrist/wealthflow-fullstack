import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { Transaction } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { BottomSheet } from '../common/BottomSheet';
import { MonthSelector } from '../common/MonthSelector';
import { MonthlyCalendarModal } from '../common/MonthlyCalendarModal';

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

  // Filtre par mois & année
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [isMonthFilterActive, setIsMonthFilterActive] = useState<boolean>(true);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);

  const itemsPerPage = 10;

  const uniqueAccounts = useMemo(() => {
    const set = new Set(transactions.map((t) => t.account));
    return Array.from(set);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const txDate = new Date(tx.date);
        const matchesMonth =
          !isMonthFilterActive ||
          (txDate.getFullYear() === selectedYear && txDate.getMonth() === selectedMonth);

        const matchesQuery =
          !searchQuery ||
          tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.account.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === 'all' ||
          tx.categoryId === selectedCategory ||
          tx.category === selectedCategory;
        const matchesAccount = selectedAccount === 'all' || tx.account === selectedAccount;
        const matchesType = selectedType === 'all' || tx.type === selectedType;
        return matchesMonth && matchesQuery && matchesCategory && matchesAccount && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, isMonthFilterActive, selectedYear, selectedMonth, searchQuery, selectedCategory, selectedAccount, selectedType, sortBy]);

  // Calcul des statistiques cumulées pour le mois sélectionné
  const monthStats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let saved = 0;
    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      if (d.getFullYear() === selectedYear && d.getMonth() === selectedMonth) {
        if (tx.type === 'income') income += tx.amount;
        if (tx.type === 'expense') expenses += tx.amount;
        if (tx.type === 'savings_deposit') saved += tx.amount;
      }
    });
    return { income, expenses, saved };
  }, [transactions, selectedYear, selectedMonth]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedAccount !== 'all' ? 1 : 0) +
    (sortBy !== 'date_desc' ? 1 : 0);

  // ── Pills de filtre partagés ──────────────────────────────────
  const filterPills = (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
      {([
        { value: 'all', label: `Tous (${transactions.length})`, activeClass: 'bg-[#18181B] text-white' },
        { value: 'expense', label: 'Dépenses', activeClass: 'bg-[#EF4444] text-white' },
        { value: 'income', label: 'Revenus', activeClass: 'bg-[#10B981] text-white' },
        { value: 'savings_deposit', label: 'Épargne', activeClass: 'bg-[#FF5330] text-white' },
      ] as const).map(({ value, label, activeClass }) => (
        <button
          key={value}
          onClick={() => { setSelectedType(value); setCurrentPage(1); }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
            selectedType === value
              ? activeClass
              : 'bg-white border border-[#E8E8E8] text-[#6F6F73]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  // ── Ligne transaction partagée ────────────────────────────────
  const TxRow = ({ tx, compact = false }: { tx: Transaction; compact?: boolean; key?: React.Key }) => {
    const isIncome = tx.type === 'income';
    const isSavings = tx.type === 'savings_deposit';
    const cat = categories.find(c => c.id === tx.categoryId);
    return (
      <div
        onClick={() => setSelectedTxDetails(tx)}
        className={`flex items-center justify-between gap-3 cursor-pointer active:bg-[#FAFAFA] transition-colors ${
          compact ? 'py-3 border-b border-[#F5F5F5] last:border-0' : 'p-3.5'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isIncome ? 'bg-[#10B981]/10 text-[#10B981]'
            : isSavings ? 'bg-[#FF5330]/10 text-[#FF5330]'
            : 'bg-[#F7F7F7] text-[#52525B]'
          }`}>
            <CategoryIcon name={cat?.icon || tx.category} className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#18181B] truncate leading-tight">{tx.title}</p>
            <p className="text-[11px] text-[#A1A1AA] truncate mt-0.5">{tx.category} · {tx.date}</p>
          </div>
        </div>
        <p className={`text-sm font-black num-tabular flex-shrink-0 ${
          isIncome ? 'text-[#10B981]' : isSavings ? 'text-[#FF5330]' : 'text-[#18181B]'
        }`}>
          {isIncome || isSavings ? '+' : '-'}{formatCurrency(tx.amount)}
        </p>
      </div>
    );
  };

  // ── BottomSheet détails partagé ───────────────────────────────
  const txDetailsSheet = (
    <BottomSheet
      isOpen={Boolean(selectedTxDetails)}
      onClose={() => setSelectedTxDetails(null)}
      title="Détails"
      subtitle={selectedTxDetails?.title}
      maxHeight="max-h-[75vh]"
    >
      {selectedTxDetails && (
        <div className="space-y-3 pb-2">
          <div className={`text-center py-4 rounded-2xl ${
            selectedTxDetails.type === 'income' ? 'bg-[#10B981]/8'
            : selectedTxDetails.type === 'savings_deposit' ? 'bg-[#FF5330]/8'
            : 'bg-[#F7F7F7]'
          }`}>
            <p className="text-[11px] text-[#6F6F73] mb-1">Montant</p>
            <p className={`text-3xl font-black num-tabular ${
              selectedTxDetails.type === 'income' ? 'text-[#10B981]'
              : selectedTxDetails.type === 'savings_deposit' ? 'text-[#FF5330]'
              : 'text-[#18181B]'
            }`}>
              {selectedTxDetails.type === 'income' || selectedTxDetails.type === 'savings_deposit' ? '+' : '-'}{formatCurrency(selectedTxDetails.amount)}
            </p>
          </div>

          <div className="rounded-xl border border-[#F0F0F0] divide-y divide-[#F0F0F0] overflow-hidden">
            {[
              { label: 'Catégorie', value: selectedTxDetails.category },
              { label: 'Compte', value: selectedTxDetails.account },
              { label: 'Date', value: selectedTxDetails.date },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center px-3 py-2.5">
                <span className="text-xs text-[#A1A1AA]">{row.label}</span>
                <span className="text-xs font-bold text-[#18181B]">{row.value}</span>
              </div>
            ))}
            {selectedTxDetails.notes && (
              <div className="px-3 py-2.5">
                <p className="text-xs text-[#A1A1AA] mb-1">Notes</p>
                <p className="text-xs text-[#18181B] italic">{selectedTxDetails.notes}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => { deleteTransaction(selectedTxDetails.id); setSelectedTxDetails(null); }}
            className="w-full py-3 rounded-xl bg-[#FEE2E2] text-[#EF4444] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer cette opération
          </button>
        </div>
      )}
    </BottomSheet>
  );

  // ── BottomSheet filtres partagé ───────────────────────────────
  const filterSheet = (
    <BottomSheet
      isOpen={isFilterSheetOpen}
      onClose={() => setIsFilterSheetOpen(false)}
      title="Filtrer et trier"
    >
      <div className="space-y-4 py-1">
        <div>
          <label className="text-xs font-bold text-[#18181B] block mb-1.5">Trier par</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full p-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-xs font-semibold text-[#18181B]"
          >
            <option value="date_desc">Date — plus récentes</option>
            <option value="date_asc">Date — plus anciennes</option>
            <option value="amount_desc">Montant — plus élevés</option>
            <option value="amount_asc">Montant — plus faibles</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-[#18181B] block mb-1.5">Catégorie</label>
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="w-full p-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-xs font-semibold text-[#18181B]"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-[#18181B] block mb-1.5">Compte</label>
          <select
            value={selectedAccount}
            onChange={(e) => { setSelectedAccount(e.target.value); setCurrentPage(1); }}
            className="w-full p-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-xs font-semibold text-[#18181B]"
          >
            <option value="all">Tous les comptes</option>
            {uniqueAccounts.map((acc) => <option key={acc} value={acc}>{acc}</option>)}
          </select>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => { setSelectedCategory('all'); setSelectedAccount('all'); setSortBy('date_desc'); setIsFilterSheetOpen(false); }}
            className="flex-1 py-2.5 rounded-xl border border-[#E8E8E8] text-xs font-bold text-[#6F6F73]"
          >
            Réinitialiser
          </button>
          <button
            onClick={() => setIsFilterSheetOpen(false)}
            className="flex-1 py-2.5 rounded-xl bg-[#FF5330] text-white text-xs font-bold"
          >
            Appliquer
          </button>
        </div>
      </div>
    </BottomSheet>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // LAYOUT MOBILE (< lg)
  // ─────────────────────────────────────────────────────────────────────────────
  const mobileView = (
    <div className="flex flex-col pb-24">

      {/* Header */}
      <header className="px-4 pt-4 pb-3">
        <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Activité</h1>
        <p className="text-xs text-[#A1A1AA] mt-0.5">Historique de vos opérations</p>
      </header>

      {/* Sélecteur de mois & Calendrier */}
      <div className="px-4 mb-3">
        <MonthSelector
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onChange={(y, m) => {
            setSelectedYear(y);
            setSelectedMonth(m);
            setIsMonthFilterActive(true);
            setCurrentPage(1);
          }}
          onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
        />
      </div>

      {/* Stats résumé du mois sélectionné */}
      <div className="px-4 mb-4">
        <div className="flex items-stretch gap-3 p-3 rounded-2xl bg-[#F7F7F7]">
          <div className="flex-1 text-center">
            <p className="text-base font-black text-[#10B981] num-tabular">+{formatCurrency(isMonthFilterActive ? monthStats.income : totalIncome)}</p>
            <p className="text-[10px] text-[#A1A1AA] mt-0.5">Revenus</p>
          </div>
          <div className="w-px bg-[#E8E8E8]" />
          <div className="flex-1 text-center">
            <p className="text-base font-black text-[#EF4444] num-tabular">-{formatCurrency(isMonthFilterActive ? monthStats.expenses : totalExpenses)}</p>
            <p className="text-[10px] text-[#A1A1AA] mt-0.5">Dépenses</p>
          </div>
          <div className="w-px bg-[#E8E8E8]" />
          <div className="flex-1 text-center">
            <p className="text-base font-black text-[#FF5330] num-tabular">{formatCurrency(isMonthFilterActive ? monthStats.saved : totalSaved)}</p>
            <p className="text-[10px] text-[#A1A1AA] mt-0.5">Épargne</p>
          </div>
        </div>
      </div>

      {/* Barre recherche + filtres */}
      <div className="px-4 mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher une opération..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-xs font-medium text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#FF5330]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setIsFilterSheetOpen(true)}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 relative cursor-pointer ${
            activeFiltersCount > 0 ? 'bg-[#FF5330]/10 border-[#FF5330] text-[#FF5330]' : 'bg-white border-[#E8E8E8] text-[#52525B]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF5330] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Pills */}
      <div className="px-4 mb-3">{filterPills}</div>

      {/* Liste transactions — élément principal */}
      <div className="px-4">
        {paginatedTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-bold text-[#18181B] mb-1">Aucune transaction trouvée</p>
            <p className="text-xs text-[#A1A1AA] mb-4">Modifiez vos critères ou ajoutez une opération.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedType('all'); setSelectedCategory('all'); setSelectedAccount('all'); }}
              className="text-xs font-bold text-[#FF5330] underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <div className="divide-y divide-[#F5F5F5]">
              {paginatedTransactions.map((tx) => (
                <TxRow key={tx.id} tx={tx} compact />
              ))}
            </div>

            {/* Pagination mobile */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 pb-2">
                <p className="text-xs text-[#A1A1AA]">
                  Page <span className="font-bold text-[#18181B]">{currentPage}</span> / {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-lg bg-white border border-[#E8E8E8] flex items-center justify-center disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#18181B]" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 rounded-lg bg-white border border-[#E8E8E8] flex items-center justify-center disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 text-[#18181B]" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {filterSheet}
      {txDetailsSheet}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // LAYOUT DESKTOP (>= lg) — conservé
  // ─────────────────────────────────────────────────────────────────────────────
  const desktopView = (
    <div id="transactions-view" className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
            Activité & Journal des Flux
          </h2>
          <p className="text-xs text-[#6F6F73] mt-0.5">
            Historique complet de vos dépenses, revenus et versements
          </p>
        </div>
      </div>

      {/* Sélecteur de mois & Calendrier */}
      <MonthSelector
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onChange={(y, m) => {
          setSelectedYear(y);
          setSelectedMonth(m);
          setIsMonthFilterActive(true);
          setCurrentPage(1);
        }}
        onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
      />

      {/* Stats du mois sélectionné */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-0.5">
          <p className="text-[10px] font-semibold text-[#6F6F73]">Revenus du mois</p>
          <p className="text-xs sm:text-sm font-black text-[#10B981] num-tabular truncate">+{formatCurrency(isMonthFilterActive ? monthStats.income : totalIncome)}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-0.5">
          <p className="text-[10px] font-semibold text-[#6F6F73]">Dépenses du mois</p>
          <p className="text-xs sm:text-sm font-black text-[#EF4444] num-tabular truncate">-{formatCurrency(isMonthFilterActive ? monthStats.expenses : totalExpenses)}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-[#E8E8E8] shadow-2xs space-y-0.5">
          <p className="text-[10px] font-semibold text-[#6F6F73]">Épargne du mois</p>
          <p className="text-xs sm:text-sm font-black text-[#FF5330] num-tabular truncate">{formatCurrency(isMonthFilterActive ? monthStats.saved : totalSaved)}</p>
        </div>
      </div>

      {/* Search + filtres */}
      <div className="space-y-2.5">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une opération, catégorie, compte..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-xs font-semibold text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#FF5330] transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setIsFilterSheetOpen(true)}
            className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer relative ${
              activeFiltersCount > 0 ? 'bg-[#FF5330]/10 border-[#FF5330] text-[#FF5330]' : 'bg-white border-[#E8E8E8] text-[#18181B]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF5330] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
        {filterPills}
      </div>

      {/* Liste */}
      <div className="rounded-2xl bg-white border border-[#E8E8E8] shadow-2xs divide-y divide-[#F0F0F0] overflow-hidden">
        {paginatedTransactions.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="font-bold text-sm text-[#18181B]">Aucune transaction trouvée.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedType('all'); setSelectedCategory('all'); setSelectedAccount('all'); }}
              className="mt-2 text-xs font-bold text-[#FF5330]"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          paginatedTransactions.map((tx) => <TxRow key={tx.id} tx={tx} />)
        )}
      </div>

      {/* Pagination desktop */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-[#6F6F73]">
            Page <span className="font-bold text-[#18181B]">{currentPage}</span> sur {totalPages}
          </p>
          <div className="flex items-center space-x-1.5">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-xl bg-white border border-[#E8E8E8] disabled:opacity-40 cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-xl bg-white border border-[#E8E8E8] disabled:opacity-40 cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {filterSheet}
      {txDetailsSheet}

      {/* Modal du calendrier mensuel */}
      <MonthlyCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        transactions={transactions}
        initialYear={selectedYear}
        initialMonth={selectedMonth}
        formatCurrency={formatCurrency}
      />
    </div>
  );

  return (
    <>
      <div className="lg:hidden animate-in fade-in duration-200">{mobileView}</div>
      <div className="hidden lg:block animate-in fade-in duration-200">{desktopView}</div>
    </>
  );
};
