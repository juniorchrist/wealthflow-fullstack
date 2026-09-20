import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ArrowUpRight, ArrowDownRight, PiggyBank, Calendar as CalendarIcon } from 'lucide-react';
import { Transaction } from '../../types';

interface MonthlyCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  initialYear: number;
  initialMonth: number;
  formatCurrency: (amount: number) => string;
  onMonthChange?: (year: number, month: number) => void;
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const MONTH_NAMES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export const MonthlyCalendarModal: React.FC<MonthlyCalendarModalProps> = ({
  isOpen,
  onClose,
  transactions,
  initialYear,
  initialMonth,
  formatCurrency,
  onMonthChange,
}) => {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);

  React.useEffect(() => {
    setYear(initialYear);
    setMonth(initialMonth);
  }, [initialYear, initialMonth]);

  if (!isOpen) return null;

  const handlePrevMonth = () => {
    let newYear = year;
    let newMonth = month;
    if (month === 0) {
      newYear = year - 1;
      newMonth = 11;
    } else {
      newMonth = month - 1;
    }
    setYear(newYear);
    setMonth(newMonth);
    setSelectedDayDate(null);
    onMonthChange?.(newYear, newMonth);
  };

  const handleNextMonth = () => {
    let newYear = year;
    let newMonth = month;
    if (month === 11) {
      newYear = year + 1;
      newMonth = 0;
    } else {
      newMonth = month + 1;
    }
    setYear(newYear);
    setMonth(newMonth);
    setSelectedDayDate(null);
    onMonthChange?.(newYear, newMonth);
  };

  // Calcul du premier jour du mois et du nombre total de jours
  const firstDayOfMonthIndex = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = Lundi, 6 = Dimanche
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Agrégation des transactions du mois
  const transactionsByDate: Record<string, Transaction[]> = {};
  let monthTotalIncome = 0;
  let monthTotalExpenses = 0;
  let monthTotalSaved = 0;

  transactions.forEach((tx) => {
    const txDate = new Date(tx.date);
    if (txDate.getFullYear() === year && txDate.getMonth() === month) {
      // Clé YYYY-MM-DD
      const dateKey = txDate.toISOString().split('T')[0];
      if (!transactionsByDate[dateKey]) {
        transactionsByDate[dateKey] = [];
      }
      transactionsByDate[dateKey].push(tx);

      if (tx.type === 'income') monthTotalIncome += tx.amount;
      if (tx.type === 'expense') monthTotalExpenses += tx.amount;
      if (tx.type === 'savings_deposit') monthTotalSaved += tx.amount;
    }
  });

  const selectedDayTransactions = selectedDayDate ? transactionsByDate[selectedDayDate] || [] : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E8E8E8] p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête de la modal */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5330]/10 flex items-center justify-center text-[#FF5330]">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#18181B] tracking-tight">
                Calendrier des Dépenses & Flux
              </h2>
              <p className="text-xs text-[#71717A]">
                Consultez le détail des opérations jour par jour
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#6F6F73] hover:text-[#18181B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sélecteur de mois dans la modal */}
        <div className="flex items-center justify-between bg-[#FAFAFA] p-3 rounded-2xl border border-[#E8E8E8]">
          <button
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-xl bg-white border border-[#E8E8E8] text-[#18181B] flex items-center justify-center hover:bg-[#F0F0F0] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-black text-[#18181B] uppercase tracking-wide">
            {MONTH_NAMES[month]} {year}
          </span>

          <button
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-xl bg-white border border-[#E8E8E8] text-[#18181B] flex items-center justify-center hover:bg-[#F0F0F0] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Résumé du mois */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          <div className="p-2.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20">
            <p className="text-[10px] font-bold text-[#10B981] uppercase">Revenus</p>
            <p className="text-xs sm:text-sm font-black text-[#10B981] truncate">{formatCurrency(monthTotalIncome)}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20">
            <p className="text-[10px] font-bold text-[#EF4444] uppercase">Dépenses</p>
            <p className="text-xs sm:text-sm font-black text-[#EF4444] truncate">{formatCurrency(monthTotalExpenses)}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FF5330]/10 border border-[#FF5330]/20">
            <p className="text-[10px] font-bold text-[#FF5330] uppercase">Épargne</p>
            <p className="text-xs sm:text-sm font-black text-[#FF5330] truncate">{formatCurrency(monthTotalSaved)}</p>
          </div>
        </div>

        {/* Grille du calendrier */}
        <div>
          {/* En-tête des jours de la semaine */}
          <div className="grid grid-cols-7 gap-1 mb-1 text-center">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d} className="text-[10px] font-bold text-[#A1A1AA] uppercase">
                {d}
              </span>
            ))}
          </div>

          {/* Jours du mois */}
          <div className="grid grid-cols-7 gap-1">
            {/* Cases vides du début de mois */}
            {Array.from({ length: firstDayOfMonthIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14 sm:h-16 rounded-xl bg-[#FAFAFA]/50 border border-transparent" />
            ))}

            {/* Jours réels du mois */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayTxs = transactionsByDate[dateStr] || [];
              const isSelected = selectedDayDate === dateStr;

              const dayExpenseSum = dayTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
              const dayIncomeSum = dayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

              const isToday =
                new Date().getFullYear() === year &&
                new Date().getMonth() === month &&
                new Date().getDate() === dayNum;

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDayDate(dateStr)}
                  className={`h-14 sm:h-16 p-1 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'border-[#FF5330] bg-[#FF5330]/10 shadow-xs'
                      : isToday
                      ? 'border-[#3B82F6] bg-[#3B82F6]/5'
                      : dayTxs.length > 0
                      ? 'border-[#E8E8E8] bg-white hover:bg-[#FAFAFA]'
                      : 'border-[#F4F4F5] bg-[#FAFAFA] text-[#A1A1AA]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold ${isToday ? 'text-[#3B82F6]' : 'text-[#18181B]'}`}>
                      {dayNum}
                    </span>
                    {dayTxs.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5330]" />
                    )}
                  </div>

                  {/* Sommes rapides sur la case */}
                  <div className="space-y-0.5">
                    {dayExpenseSum > 0 && (
                      <p className="text-[9px] font-bold text-[#EF4444] truncate leading-none">
                        -{Math.round(dayExpenseSum)}
                      </p>
                    )}
                    {dayIncomeSum > 0 && (
                      <p className="text-[9px] font-bold text-[#10B981] truncate leading-none">
                        +{Math.round(dayIncomeSum)}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Détails du jour sélectionné */}
        {selectedDayDate && (
          <div className="pt-3 border-t border-[#E8E8E8] space-y-2 animate-in fade-in">
            <h4 className="text-xs font-bold text-[#18181B]">
              Opérations du {new Date(selectedDayDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} ({selectedDayTransactions.length})
            </h4>

            {selectedDayTransactions.length === 0 ? (
              <p className="text-xs text-[#71717A] italic">Aucune opération enregistrée pour ce jour.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {selectedDayTransactions.map((tx) => (
                  <div key={tx.id} className="p-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${
                        tx.type === 'income' ? 'bg-[#10B981]' : tx.type === 'savings_deposit' ? 'bg-[#FF5330]' : 'bg-[#EF4444]'
                      }`}>
                        {tx.type === 'income' ? <ArrowDownRight className="w-3.5 h-3.5" /> : tx.type === 'savings_deposit' ? <PiggyBank className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#18181B] truncate">{tx.title}</p>
                        <p className="text-[10px] text-[#71717A]">{tx.category} · {tx.account}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-black ${
                      tx.type === 'income' ? 'text-[#10B981]' : tx.type === 'savings_deposit' ? 'text-[#FF5330]' : 'text-[#18181B]'
                    }`}>
                      {tx.type === 'income' || tx.type === 'savings_deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
