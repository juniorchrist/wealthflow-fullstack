import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useWealth } from '../../context/WealthContext';

export const NewCategoryModal: React.FC = () => {
  const { isNewCategoryModalOpen, setIsNewCategoryModalOpen, addCategory } = useWealth();

  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [budgetLimit, setBudgetLimit] = useState('');

  if (!isNewCategoryModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCategory({
      name: name.trim(),
      type,
      budgetLimit: Number(budgetLimit) || 0,
      color: '#FF5330',
      icon: 'Tag',
    });

    setName('');
    setBudgetLimit('');
    setIsNewCategoryModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8E8E8] space-y-5 animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E8]">
          <div>
            <h3 className="text-lg font-extrabold text-[#18181B]">Nouvelle Catégorie</h3>
            <p className="text-xs text-[#6F6F73]">Créez une catégorie pour vos opérations</p>
          </div>
          <button
            onClick={() => setIsNewCategoryModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#F7F7F7] hover:bg-[#E8E8E8] flex items-center justify-center text-[#6F6F73] hover:text-[#18181B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Type */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-[#EF4444] text-white shadow-sm'
                  : 'bg-[#F7F7F7] border border-[#E8E8E8] text-[#6F6F73]'
              }`}
            >
              Catégorie de Dépense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-[#10B981] text-white shadow-sm'
                  : 'bg-[#F7F7F7] border border-[#E8E8E8] text-[#6F6F73]'
              }`}
            >
              Catégorie d’Entrée
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-bold text-[#18181B] block mb-1">Nom de la catégorie *</label>
            <input
              type="text"
              required
              placeholder="Ex: Éducation, Factures Internet, Sport..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] text-xs sm:text-sm font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
            />
          </div>

          {/* Budget Limit (if expense) */}
          {type === 'expense' && (
            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1">Plafond budgétaire mensuel (FCFA)</label>
              <input
                type="number"
                min={0}
                placeholder="Ex: 100 000"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] text-xs sm:text-sm font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
              />
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-3 border-t border-[#E8E8E8] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsNewCategoryModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6F6F73] hover:text-[#18181B] hover:bg-[#F7F7F7] cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#FF5330] hover:bg-[#E84524] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              Créer la catégorie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
