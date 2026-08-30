import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit3, Trash2, Tag, Check, X, ShieldAlert, Power } from 'lucide-react';
import { AppState, Category } from '../types';
import { AVAILABLE_COLORS, AVAILABLE_ICONS } from '../utils/constants';
import { CategoryIcon } from './ui/CategoryIcon';
import { formatFCFA } from '../utils/formatters';

interface CategoriesViewProps {
  state: AppState;
  onSaveCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onToggleCategory?: (categoryId: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  state,
  onSaveCategory,
  onDeleteCategory,
  onToggleCategory,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [color, setColor] = useState(AVAILABLE_COLORS[0]);
  const [icon, setIcon] = useState(AVAILABLE_ICONS[0]);
  const [type, setType] = useState<'expense' | 'income' | 'both'>('expense');
  const [error, setError] = useState('');

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setColor(AVAILABLE_COLORS[Math.floor(Math.random() * AVAILABLE_COLORS.length)]);
    setIcon(AVAILABLE_ICONS[0]);
    setType('expense');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setColor(cat.color);
    setIcon(cat.icon);
    setType(cat.type);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Veuillez renseigner un nom de catégorie.');
      return;
    }

    const newCategory: Category = {
      id: editingCat ? editingCat.id : `cat-custom-${Date.now()}`,
      name: name.trim(),
      color,
      icon,
      type,
      isDefault: editingCat?.isDefault || false,
    };

    onSaveCategory(newCategory);
    setIsModalOpen(false);
  };

  return (
    <div className="wf-page animate-slideUp space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 liquid-card">
        <div>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--wf-primary-soft)', color: 'var(--wf-primary)' }}
            >
              <Tag size={20} />
            </div>
            <div>
              <h1 className="wf-title-section text-base sm:text-lg">
                Gestion des Catégories
              </h1>
              <p className="text-xs" style={{ color: 'var(--wf-text-secondary)' }}>
                Personnalisez vos libellés, icônes et codes couleurs
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 touch-target"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Ajouter une catégorie</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {state.categories.map((cat) => {
          const usageCount = state.transactions.filter((tx) => tx.categoryId === cat.id).length;
          const totalSpent = state.transactions
            .filter((tx) => tx.categoryId === cat.id && tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);
          const isActive = cat.isActive ?? true;

          return (
            <div
              key={cat.id}
              className={`liquid-card p-4 flex flex-col justify-between transition-all ${
                isActive ? '' : 'opacity-55'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#EAE5DC]"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      color: cat.color,
                    }}
                  >
                    <CategoryIcon name={cat.icon} className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1">
                    {onToggleCategory && (
                      <button
                        onClick={() => onToggleCategory(cat.id)}
                        className="p-1.5 text-[#8C827A] hover:text-[#1F1B18] rounded-lg hover:bg-[#FBF9F4] cursor-pointer"
                        title={isActive ? 'Désactiver la catégorie' : 'Activer la catégorie'}
                        aria-pressed={isActive}
                      >
                        <Power
                          className="w-4 h-4"
                          style={{ color: isActive ? 'var(--wf-success)' : 'var(--wf-text-tertiary)' }}
                        />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-[#8C827A] hover:text-[#1F1B18] rounded-lg hover:bg-[#FBF9F4] cursor-pointer"
                      title="Modifier la catégorie"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {!cat.isDefault && (
                      <button
                        onClick={() => onDeleteCategory(cat.id)}
                        className="p-1.5 text-[#8C827A] hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Supprimer la catégorie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-xs text-[#1F1B18]">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        cat.type === 'expense'
                          ? 'bg-[#EB5738]/10 text-[#EB5738]'
                          : cat.type === 'income'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-[#FBF9F4] text-[#635A52]'
                      }`}
                    >
                      {cat.type === 'expense'
                        ? 'Dépenses'
                        : cat.type === 'income'
                        ? 'Revenus'
                        : 'Mixte'}
                    </span>
                    {!isActive && (
                      <span className="text-[10px] font-semibold" style={{ color: 'var(--wf-danger)' }}>
                        Désactivée
                      </span>
                    )}
                    {cat.isDefault && (
                      <span className="text-[10px] font-medium text-[#8C827A]">Par défaut</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#F0EBE1] text-[11px] flex items-center justify-between text-[#7D736A]">
                <span>{usageCount} transaction(s)</span>
                {totalSpent > 0 && (
                  <strong className="text-[#1F1B18] tabular-nums font-bold">
                    {formatFCFA(totalSpent)}
                  </strong>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Category */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-[#EAE5DC] shadow-2xl p-5"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F0EBE1]">
                <h3 className="text-sm font-bold text-[#1F1B18]">
                  {editingCat ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#8C827A] hover:text-[#1F1B18] p-1 rounded-lg hover:bg-[#FBF9F4]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="category-name-input" className="block text-xs font-bold text-[#1F1B18] mb-1">
                    Nom de la catégorie <span className="text-[#EB5738]">*</span>
                  </label>
                  <input
                    id="category-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError('');
                    }}
                    placeholder="Ex: Épicerie, Transport, Loyer..."
                    className="w-full px-3.5 py-2 text-xs bg-[#FBF9F4] border border-[#EAE5DC] rounded-xl outline-none focus:border-[#EB5738] text-[#1F1B18]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1B18] mb-1">
                    Nature des flux
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'expense', label: 'Dépenses' },
                      { key: 'income', label: 'Revenus' },
                      { key: 'both', label: 'Mixte' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setType(item.key as any)}
                        className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          type === item.key
                            ? 'bg-[#EB5738] text-white border-[#EB5738] shadow-xs'
                            : 'bg-[#FBF9F4] text-[#635A52] border-[#EAE5DC] hover:bg-[#F4EFE6]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-xs font-bold text-[#1F1B18] mb-1.5">
                    Couleur associée
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-7 h-7 rounded-xl transition-transform cursor-pointer flex items-center justify-center ${
                          color === c ? 'scale-110 ring-2 ring-[#EB5738] ring-offset-2' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c }}
                      >
                        {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Picker */}
                <div>
                  <label className="block text-xs font-bold text-[#1F1B18] mb-1.5">
                    Icône
                  </label>
                  <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 bg-[#FBF9F4] rounded-xl border border-[#EAE5DC]">
                    {AVAILABLE_ICONS.map((iconName) => {
                      const isSelected = icon === iconName;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setIcon(iconName)}
                          className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#EB5738] text-white shadow-xs'
                              : 'text-[#7D736A] hover:text-[#1F1B18]'
                          }`}
                        >
                          <CategoryIcon name={iconName} className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

                <div className="flex justify-end gap-2 pt-2 border-t border-[#F0EBE1]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-[#635A52] hover:bg-[#FBF9F4] rounded-xl cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-[#EB5738] hover:bg-[#D44729] rounded-xl shadow-[0_4px_12px_rgba(235,87,56,0.3)] cursor-pointer"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
