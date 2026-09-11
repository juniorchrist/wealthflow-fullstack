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
      <div className="bg-white rounded-t-[20px] sm:rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl border-t sm:border border-[#E8E8E8] space-y-3 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
        
        {/* Modal Handle for mobile */}
        <div className="w-8 h-1 bg-[#D4D4D8] rounded-full mx-auto sm:hidden -mt-1 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#18181B]">
              Nouvelle Transaction
            </h3>
            <p className="text-[10px] text-[#6F6F73]">
              Enregistrez une entrée, dépense ou épargne
            </p>
          </div>
          <button
            onClick={() => setIsNewTransactionModalOpen(false)}
            className="w-7 h-7 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#6F6F73] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Type Selector (Pills) */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-[#EF4444] text-white shadow-xs'
                  : 'bg-[#F7F7F7] border border-[#E8E8E8] text-[#6F6F73]'
              }`}
            >
              <ArrowDownRight className="w-3 h-3" />
              <span>Dépense</span>
            </button>

            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-[#10B981] text-white shadow-xs'
                  : 'bg-[#F7F7F7] border border-[#E8E8E8] text-[#6F6F73]'
              }`}
            >
              <ArrowUpRight className="w-3 h-3" />
              <span>Revenu</span>
            </button>

            <button
              type="button"
              onClick={() => setType('savings_deposit')}
              className={`py-2 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                type === 'savings_deposit'
                  ? 'bg-[#FF5330] text-white shadow-xs'
                  : 'bg-[#F7F7F7] border border-[#E8E8E8] text-[#6F6F73]'
              }`}
            >
              <PiggyBank className="w-3 h-3" />
              <span>Épargne</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-[10px] font-bold text-[#18181B] block mb-1">
              Montant (FCFA) <span className="text-[#FF5330]">*</span>
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full p-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-lg text-base font-black text-[#18181B] focus:outline-none focus:border-[#FF5330] num-tabular"
            />
          </div>

          {/* Title */}
          <div>
            <label className="text-[10px] font-bold text-[#18181B] block mb-1">
              Description / Libellé <span className="text-[#FF5330]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Supermarché, Salaire, Facture..."
              className="w-full p-2 bg-[#F7F7F7] border border-[#E8E8E8] rounded-lg text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-bold text-[#18181B] block mb-1">Catégorie</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2 bg-[#F7F7F7] border border-[#E8E8E8] rounded-lg text-[10px] font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
            >
              <option value="">Sélectionner...</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="text-[10px] font-bold text-[#18181B] block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-[#F7F7F7] border border-[#E8E8E8] rounded-lg text-[10px] font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#18181B] block mb-1">Notes (optionnel)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Détails..."
                className="w-full p-2 bg-[#F7F7F7] border border-[#E8E8E8] rounded-lg text-[10px] font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-1 flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setIsNewTransactionModalOpen(false)}
              className="flex-1 py-2.5 rounded-lg border border-[#E8E8E8] text-[10px] font-bold text-[#6F6F73] cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-[#FF5330] active:scale-[0.98] text-white text-[10px] font-extrabold shadow-sm transition-all cursor-pointer"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
