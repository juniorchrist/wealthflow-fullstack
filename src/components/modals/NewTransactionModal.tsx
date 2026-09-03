import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, PiggyBank, Plus, X } from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { TransactionType } from '../../types';

export const NewTransactionModal: React.FC = () => {
  const { isNewTransactionModalOpen, setIsNewTransactionModalOpen, categories, addTransaction } =
    useWealth();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [account, setAccount] = useState('Compte principal');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isNewTransactionModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!title.trim() || numAmount <= 0) return;

    const matchedCat = categories.find((c) => c.id === categoryId);
    const categoryName = matchedCat ? matchedCat.name : type === 'income' ? 'Revenus' : 'Divers';

    addTransaction({
      title: title.trim(),
      amount: numAmount,
      type,
      category: categoryName,
      categoryId: categoryId || (matchedCat ? matchedCat.id : 'cat-1'),
      account,
      date,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      notes: notes.trim() || undefined,
    });

    // Reset and close
    setTitle('');
    setAmount('');
    setNotes('');
    setIsNewTransactionModalOpen(false);
  };

  const availableCategories = categories.filter((c) => {
    if (type === 'income') return c.type === 'income';
    return c.type === 'expense';
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-t-[28px] sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border-t sm:border border-[#E8E8E8] space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        
        {/* Modal Handle for mobile */}
        <div className="w-10 h-1 bg-[#D4D4D8] rounded-full mx-auto sm:hidden -mt-1 mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#18181B]">
              Nouvelle Transaction
            </h3>
            <p className="text-xs text-[#6F6F73]">
              Enregistrez une entrée, une dépense ou un versement
            </p>
          </div>
          <button
            onClick={() => setIsNewTransactionModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#F7F7F7] hover:bg-[#E8E8E8] flex items-center justify-center text-[#6F6F73] hover:text-[#18181B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Type Selector (Pills) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-[#EF4444] text-white shadow-xs'
                  : 'bg-[#F7F7F7] border border-[#E8E8E8] text-[#6F6F73] hover:text-[#18181B]'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Dépense</span>
            </button>

            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-[#10B981] text-white shadow-xs'
                  : 'bg-[#F7F7F7] border border-[#E8E8E8] text-[#6F6F73] hover:text-[#18181B]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Revenu</span>
            </button>

            <button
              type="button"
              onClick={() => setType('savings_deposit')}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                type === 'savings_deposit'
                  ? 'bg-[#FF5330] text-white shadow-xs'
                  : 'bg-[#F7F7F7] border border-[#E8E8E8] text-[#6F6F73] hover:text-[#18181B]'
              }`}
            >
              <PiggyBank className="w-4 h-4" />
              <span>Épargne</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-xs font-bold text-[#18181B] block mb-1">
              Montant (FCFA) <span className="text-[#FF5330]">*</span>
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full p-3 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-lg font-black text-[#18181B] focus:outline-none focus:border-[#FF5330] num-tabular"
            />
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-[#18181B] block mb-1">
              Description / Libellé <span className="text-[#FF5330]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Supermarché, Salaire, Facture..."
              className="w-full p-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
            />
          </div>

          {/* Category & Account */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1">Catégorie</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
              >
                <option value="">Sélectionner...</option>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1">Compte / Mode</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full p-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
              >
                <option value="Compte principal">Compte principal</option>
                <option value="Wave Mobile Money">Wave Mobile Money</option>
                <option value="Orange Money">Orange Money</option>
                <option value="Espèces / Portefeuille">Espèces</option>
              </select>
            </div>
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1">Notes (optionnel)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Détails supplémentaires..."
                className="w-full p-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsNewTransactionModalOpen(false)}
              className="flex-1 py-3 rounded-xl border border-[#E8E8E8] text-xs font-bold text-[#6F6F73] hover:text-[#18181B] cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-[#FF5330] hover:bg-[#E84524] active:scale-[0.98] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            >
              Enregistrer l'opération
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
