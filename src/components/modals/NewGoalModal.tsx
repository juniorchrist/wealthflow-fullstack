import React, { useState } from 'react';
import { Car, GraduationCap, PiggyBank, Plane, Shield, X } from 'lucide-react';
import { useWealth } from '../../context/WealthContext';

export const NewGoalModal: React.FC = () => {
  const { isNewGoalModalOpen, setIsNewGoalModalOpen, addSavingsGoal } = useWealth();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('Déc. 2026');
  const [icon, setIcon] = useState('PiggyBank');
  const [checkboxesCount, setCheckboxesCount] = useState(10);
  const [isAutoSaveActive, setIsAutoSaveActive] = useState(false);
  const [autoSaveAmount, setAutoSaveAmount] = useState(50000);

  if (!isNewGoalModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(targetAmount);
    if (!title.trim() || target <= 0) return;

    const initialCurrent = Number(currentAmount) || 0;

    addSavingsGoal({
      title: title.trim(),
      targetAmount: target,
      currentAmount: initialCurrent,
      deadline,
      icon,
      color: '#FF5330',
      checkboxesCount,
      checkedBoxes: [],
      isAutoSaveActive,
      autoSaveAmount: isAutoSaveActive ? Number(autoSaveAmount) : undefined,
    });

    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setIsNewGoalModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E8E8E8] space-y-5 animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E8]">
          <div>
            <h3 className="text-lg font-extrabold text-[#18181B]">Nouvel Objectif d’Épargne</h3>
            <p className="text-xs text-[#6F6F73]">Définissez un projet, une cible financière et un calendrier</p>
          </div>
          <button
            onClick={() => setIsNewGoalModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#F7F7F7] hover:bg-[#E8E8E8] flex items-center justify-center text-[#6F6F73] hover:text-[#18181B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-[#18181B] block mb-1">Nom du projet *</label>
            <input
              type="text"
              required
              placeholder="Ex: Achat de moto, Voyage au Sénégal, Mac..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] text-xs sm:text-sm font-semibold text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#FF5330]"
            />
          </div>

          {/* Target Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1">Montant Cible (FCFA) *</label>
              <input
                type="number"
                required
                min={1000}
                placeholder="Ex: 1 500 000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] text-xs sm:text-sm font-bold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1">Épargne initiale (FCFA)</label>
              <input
                type="number"
                min={0}
                placeholder="Ex: 100 000"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] text-xs sm:text-sm font-bold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
              />
            </div>
          </div>

          {/* Deadline & Icon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1">Échéance prévue</label>
              <input
                type="text"
                placeholder="Ex: Juin 2027, Déc. 2026..."
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1">Nombre de cases à cocher</label>
              <select
                value={checkboxesCount}
                onChange={(e) => setCheckboxesCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
              >
                <option value={10}>10 cases (étapes de 10%)</option>
                <option value={20}>20 cases (étapes de 5%)</option>
                <option value={12}>12 cases (1 par mois)</option>
              </select>
            </div>
          </div>

          {/* Icon Choice */}
          <div>
            <label className="text-xs font-bold text-[#18181B] block mb-1.5">Icône représentative</label>
            <div className="flex items-center space-x-2">
              {[
                { name: 'PiggyBank', icon: <PiggyBank className="w-4 h-4" /> },
                { name: 'Car', icon: <Car className="w-4 h-4" /> },
                { name: 'Plane', icon: <Plane className="w-4 h-4" /> },
                { name: 'Shield', icon: <Shield className="w-4 h-4" /> },
                { name: 'GraduationCap', icon: <GraduationCap className="w-4 h-4" /> },
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIcon(item.name)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    icon === item.name
                      ? 'bg-[#FF5330] text-white border-[#FF5330] shadow-sm'
                      : 'bg-[#FAFAFA] border-[#E8E8E8] text-[#18181B] hover:border-[#FF5330]'
                  }`}
                >
                  {item.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-save Toggle */}
          <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#18181B] block">Activer l’épargne mensuelle automatique</span>
              <span className="text-[11px] text-[#6F6F73]">Programmer un virement récurent vers cette tirelire</span>
            </div>
            <input
              type="checkbox"
              checked={isAutoSaveActive}
              onChange={(e) => setIsAutoSaveActive(e.target.checked)}
              className="w-4 h-4 accent-[#FF5330] cursor-pointer"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-3 border-t border-[#E8E8E8] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsNewGoalModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6F6F73] hover:text-[#18181B] hover:bg-[#F7F7F7] cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#FF5330] hover:bg-[#E84524] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              Créer la tirelire
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
