import React, { useState } from 'react';
import { Edit2, Plus, Tags, Trash2 } from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { Category } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { BottomSheet } from '../common/BottomSheet';

export const CategoriesView: React.FC = () => {
  const {
    categories,
    updateCategory,
    deleteCategory,
    formatCurrency,
    setIsNewCategoryModalOpen,
  } = useWealth();

  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editBudget, setEditBudget] = useState('0');

  const filteredCategories = categories.filter((c) => {
    if (filterType === 'all') return true;
    return c.type === filterType;
  });

  const handleStartEdit = (cat: Category) => {
    setEditingCat(cat);
    setEditName(cat.name);
    setEditBudget(String(cat.budgetLimit || 0));
  };

  const handleSaveEdit = () => {
    if (editingCat && editName.trim()) {
      updateCategory(editingCat.id, {
        name: editName.trim(),
        budgetLimit: Math.max(0, Number(editBudget) || 0),
      });
      setEditingCat(null);
    }
  };

  return (
    <div id="categories-view" className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      
      {/* 1. Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
            Catégories
          </h2>
          <p className="text-xs text-[#6F6F73] mt-0.5">
            Organisez et personnalisez la classification de vos flux
          </p>
        </div>

        <button
          onClick={() => setIsNewCategoryModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 py-2 px-3.5 rounded-xl bg-[#FF5330] hover:bg-[#E84524] active:scale-95 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nouvelle catégorie</span>
        </button>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filterType === 'all'
              ? 'bg-[#18181B] text-white shadow-xs'
              : 'bg-white border border-[#E8E8E8] text-[#6F6F73] hover:text-[#18181B]'
          }`}
        >
          Toutes ({categories.length})
        </button>
        <button
          onClick={() => setFilterType('expense')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filterType === 'expense'
              ? 'bg-[#18181B] text-white shadow-xs'
              : 'bg-white border border-[#E8E8E8] text-[#6F6F73] hover:text-[#18181B]'
          }`}
        >
          Dépenses ({categories.filter((c) => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setFilterType('income')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filterType === 'income'
              ? 'bg-[#18181B] text-white shadow-xs'
              : 'bg-white border border-[#E8E8E8] text-[#6F6F73] hover:text-[#18181B]'
          }`}
        >
          Revenus ({categories.filter((c) => c.type === 'income').length})
        </button>
      </div>

      {/* 3. Category List */}
      <div className="rounded-xl bg-white border border-[#E8E8E8] shadow-2xs divide-y divide-[#F0F0F0] overflow-hidden">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="p-3 flex items-center justify-between gap-3 hover:bg-[#FAFAFA] transition-colors"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#F7F7F7] flex items-center justify-center text-[#18181B] flex-shrink-0">
                <CategoryIcon name={cat.name} className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm text-[#18181B] truncate">{cat.name}</p>
                <p className="text-[11px] text-[#6F6F73] truncate">
                  {cat.type === 'expense'
                    ? `Plafond : ${formatCurrency(cat.budgetLimit)}`
                    : 'Catégorie de revenu'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => handleStartEdit(cat)}
                className="p-2 rounded-lg text-[#6F6F73] hover:text-[#18181B] hover:bg-[#F7F7F7] transition-colors cursor-pointer"
                title="Modifier"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => deleteCategory(cat.id)}
                className="p-2 rounded-lg text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Edit Category Bottom Sheet */}
      <BottomSheet
        isOpen={Boolean(editingCat)}
        onClose={() => setEditingCat(null)}
        title="Modifier la catégorie"
        subtitle={editingCat?.name}
      >
        {editingCat && (
          <div className="space-y-4 py-1">
            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1.5">
                Nom de la catégorie
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full p-3 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-xs font-semibold text-[#18181B]"
              />
            </div>

            {editingCat.type === 'expense' && (
              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1.5">
                  Plafond mensuel (FCFA)
                </label>
                <input
                  type="number"
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  className="w-full p-3 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-xs font-semibold text-[#18181B]"
                />
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setEditingCat(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E8E8E8] text-xs font-bold text-[#6F6F73]"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 rounded-xl bg-[#FF5330] text-white text-xs font-bold shadow-xs"
              >
                Enregistrer
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

    </div>
  );
};
