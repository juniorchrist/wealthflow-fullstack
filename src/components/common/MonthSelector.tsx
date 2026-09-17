import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface MonthSelectorProps {
  selectedYear: number;
  selectedMonth: number; // 0 à 11
  onChange: (year: number, month: number) => void;
  onOpenCalendarModal?: () => void;
}

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

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedYear,
  selectedMonth,
  onChange,
  onOpenCalendarModal,
}) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth;

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      onChange(selectedYear - 1, 11);
    } else {
      onChange(selectedYear, selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      onChange(selectedYear + 1, 0);
    } else {
      onChange(selectedYear, selectedMonth + 1);
    }
  };

  const handleReset = () => {
    onChange(currentYear, currentMonth);
  };

  return (
    <div className="flex items-center justify-between gap-2 bg-white border border-[#E8E8E8] p-2 sm:p-2.5 rounded-2xl shadow-2xs">
      {/* Bouton mois précédent */}
      <button
        onClick={handlePrevMonth}
        className="w-8 h-8 rounded-xl bg-[#F7F7F7] hover:bg-[#EAEAEA] text-[#18181B] flex items-center justify-center transition-colors cursor-pointer"
        title="Mois précédent"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Libellé du mois & Année */}
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm font-black text-[#18181B] uppercase tracking-wide">
          {MONTH_NAMES[selectedMonth]} {selectedYear}
        </span>

        {/* Badge "Mois en cours" ou bouton Réinitialiser */}
        {isCurrentMonth ? (
          <span className="px-2 py-0.5 rounded-md bg-[#10B981]/15 text-[#10B981] text-[10px] font-bold">
            Actuel
          </span>
        ) : (
          <button
            onClick={handleReset}
            className="px-2 py-0.5 rounded-md bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6] text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            title="Revenir au mois actuel"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Aujourd'hui</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {/* Vue Grille Calendrier */}
        {onOpenCalendarModal && (
          <button
            onClick={onOpenCalendarModal}
            className="w-8 h-8 rounded-xl bg-[#FF5330]/10 hover:bg-[#FF5330]/20 text-[#FF5330] flex items-center justify-center transition-colors cursor-pointer"
            title="Vue calendrier mensuelle"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
        )}

        {/* Bouton mois suivant */}
        <button
          onClick={handleNextMonth}
          className="w-8 h-8 rounded-xl bg-[#F7F7F7] hover:bg-[#EAEAEA] text-[#18181B] flex items-center justify-center transition-colors cursor-pointer"
          title="Mois suivant"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
