import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RotateCcw, X, Check } from 'lucide-react';

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

const MONTH_SHORT_NAMES = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Juin',
  'Juil',
  'Août',
  'Sep',
  'Oct',
  'Nov',
  'Déc',
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

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(selectedYear);

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

  const handleSelectMonthYear = (monthIdx: number) => {
    onChange(pickerYear, monthIdx);
    setIsPickerOpen(false);
  };

  const openPickerModal = () => {
    setPickerYear(selectedYear);
    setIsPickerOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between gap-2 bg-white border border-[#E8E8E8] p-2 sm:p-2.5 rounded-2xl shadow-2xs">
        {/* Bouton mois précédent */}
        <button
          onClick={handlePrevMonth}
          className="w-8 h-8 rounded-xl bg-[#F7F7F7] hover:bg-[#EAEAEA] text-[#18181B] flex items-center justify-center transition-colors cursor-pointer active:scale-95"
          title="Mois précédent"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Libellé du mois & Année — Clic pour ouvrir le sélecteur direct */}
        <div className="flex items-center gap-2">
          <button
            onClick={openPickerModal}
            className="flex items-center gap-1.5 px-2 py-1 rounded-xl hover:bg-[#F7F7F7] transition-colors cursor-pointer group"
            title="Choisir directement un mois et une année"
          >
            <span className="text-xs sm:text-sm font-black text-[#18181B] group-hover:text-[#FF5330] transition-colors uppercase tracking-wide">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </span>
          </button>

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
          {/* Bouton Icône Calendrier -> Ouvre le sélecteur direct de mois/année */}
          <button
            onClick={openPickerModal}
            className="w-8 h-8 rounded-xl bg-[#FF5330]/10 hover:bg-[#FF5330]/20 text-[#FF5330] flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            title="Sélecteur de mois et d'année"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>

          {/* Bouton mois suivant */}
          <button
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-xl bg-[#F7F7F7] hover:bg-[#EAEAEA] text-[#18181B] flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            title="Mois suivant"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── MODAL / POP-OVER DE SÉLECTION DIRECTE MOIS & ANNÉE ─── */}
      {isPickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsPickerOpen(false)}
        >
          <div
            className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-[#E8E8E8] p-5 space-y-5 animate-in zoom-in-95 duration-150 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FF5330]/10 text-[#FF5330] flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#18181B]">Sélection de la période</h3>
                  <p className="text-[10px] text-[#71717A]">Choisissez le mois et l'année à afficher</p>
                </div>
              </div>
              <button
                onClick={() => setIsPickerOpen(false)}
                className="w-7 h-7 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#6F6F73] hover:text-[#18181B] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Navigation par Année */}
            <div className="flex items-center justify-between bg-[#F7F7F7] border border-[#E8E8E8] p-2 rounded-2xl">
              <button
                onClick={() => setPickerYear((y) => y - 1)}
                className="w-8 h-8 rounded-xl bg-white border border-[#E8E8E8] text-[#18181B] flex items-center justify-center hover:bg-[#EAEAEA] transition-colors cursor-pointer"
                title="Année précédente"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-[#18181B] num-tabular">{pickerYear}</span>
                {pickerYear === currentYear && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981]">
                    En cours
                  </span>
                )}
              </div>

              <button
                onClick={() => setPickerYear((y) => y + 1)}
                className="w-8 h-8 rounded-xl bg-white border border-[#E8E8E8] text-[#18181B] flex items-center justify-center hover:bg-[#EAEAEA] transition-colors cursor-pointer"
                title="Année suivante"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Grille des 12 Mois */}
            <div>
              <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-2.5">
                Mois de l'année {pickerYear}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {MONTH_NAMES.map((name, idx) => {
                  const isSelected = selectedYear === pickerYear && selectedMonth === idx;
                  const isCurrent = currentYear === pickerYear && currentMonth === idx;

                  return (
                    <button
                      key={name}
                      onClick={() => handleSelectMonthYear(idx)}
                      className={`p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 relative active:scale-95 ${
                        isSelected
                          ? 'bg-[#FF5330] text-white shadow-md shadow-[#FF5330]/25'
                          : isCurrent
                          ? 'bg-[#FF5330]/10 border border-[#FF5330]/30 text-[#FF5330]'
                          : 'bg-[#F7F7F7] hover:bg-[#EAEAEA] border border-[#E8E8E8] text-[#18181B]'
                      }`}
                    >
                      <span>{MONTH_SHORT_NAMES[idx]}</span>
                      <span className={`text-[9px] ${isSelected ? 'text-white/80' : 'text-[#71717A]'}`}>
                        {name}
                      </span>
                      {isSelected && (
                        <Check className="w-3 h-3 absolute top-1.5 right-1.5 stroke-[3]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex items-center justify-between pt-2 border-t border-[#F0F0F0]">
              <button
                onClick={() => {
                  setPickerYear(currentYear);
                  handleSelectMonthYear(currentMonth);
                }}
                className="text-xs font-bold text-[#3B82F6] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mois actuel</span>
              </button>

              {onOpenCalendarModal && (
                <button
                  onClick={() => {
                    setIsPickerOpen(false);
                    onOpenCalendarModal();
                  }}
                  className="text-xs font-bold text-[#FF5330] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Vue jour par jour</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
