import React, { useState } from 'react';
import {
  ArrowLeftRight,
  LayoutDashboard,
  PieChart,
  PiggyBank,
  Plus,
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { BottomSheet } from '../common/BottomSheet';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsNewTransactionModalOpen } = useWealth();
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  const handleQuickAction = (type: 'expense' | 'income' | 'savings') => {
    setIsActionSheetOpen(false);
    setIsNewTransactionModalOpen(true);
  };

  const mainNavItems = [
    { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
    { id: 'transactions', label: 'Activité', icon: ArrowLeftRight },
    { id: 'budget', label: 'Budget', icon: PieChart },
    { id: 'savings', label: 'Épargne', icon: PiggyBank },
  ];

  return (
    <>
      {/* Bottom Navigation avec Glassmorphism complet - 5 éléments */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe">
        {/* Barre glassmorphism */}
        <div className="backdrop-blur-xl bg-white/80 border-t border-white/20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="pt-3 pb-4">
            <div className="grid grid-cols-5 items-end gap-0">
              
              {/* 2 icônes à gauche : Accueil + Activité */}
              {mainNavItems.slice(0, 2).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className="flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-transform"
                  >
                    <Icon 
                      className={`w-6 h-6 ${isActive ? 'text-[#FF5330]' : 'text-[#71717A]'}`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className={`text-[11px] font-semibold ${isActive ? 'text-[#FF5330]' : 'text-[#71717A]'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}

              {/* CTA Orange Centré */}
              <div className="flex flex-col items-center -mt-8">
                <button
                  onClick={() => setIsActionSheetOpen(true)}
                  className="w-14 h-14 rounded-full bg-[#FF5330] flex items-center justify-center cursor-pointer active:scale-95 transition-transform mb-1"
                >
                  <Plus className="w-7 h-7 text-white stroke-[3]" />
                </button>
              </div>

              {/* 2 icônes à droite : Budget + Épargne */}
              {mainNavItems.slice(2).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className="flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-transform"
                  >
                    <Icon 
                      className={`w-6 h-6 ${isActive ? 'text-[#FF5330]' : 'text-[#71717A]'}`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className={`text-[11px] font-semibold ${isActive ? 'text-[#FF5330]' : 'text-[#71717A]'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}

            </div>
          </div>
        </div>
      </nav>

      {/* BottomSheet Actions rapides */}
      <BottomSheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        title="Nouvelle opération"
        subtitle="Choisissez le type d'opération"
      >
        <div className="grid grid-cols-1 gap-3 py-2">
          
          {/* Dépense */}
          <button
            onClick={() => handleQuickAction('expense')}
            className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-[#EF4444]/10 to-[#EF4444]/5 border border-[#EF4444]/20 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#EF4444]/20 flex items-center justify-center flex-shrink-0">
              <ArrowLeftRight className="w-6 h-6 text-[#EF4444]" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-base font-black text-[#18181B]">Dépense</h3>
              <p className="text-sm text-[#6F6F73]">Enregistrer une sortie d'argent</p>
            </div>
          </button>

          {/* Revenu */}
          <button
            onClick={() => handleQuickAction('income')}
            className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/5 border border-[#10B981]/20 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/20 flex items-center justify-center flex-shrink-0">
              <ArrowLeftRight className="w-6 h-6 text-[#10B981]" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-base font-black text-[#18181B]">Revenu</h3>
              <p className="text-sm text-[#6F6F73]">Enregistrer une entrée d'argent</p>
            </div>
          </button>

          {/* Épargne */}
          <button
            onClick={() => handleQuickAction('savings')}
            className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-[#FF5330]/10 to-[#FF5330]/5 border border-[#FF5330]/20 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FF5330]/20 flex items-center justify-center flex-shrink-0">
              <PiggyBank className="w-6 h-6 text-[#FF5330]" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-base font-black text-[#18181B]">Épargne</h3>
              <p className="text-sm text-[#6F6F73]">Verser dans votre tirelire</p>
            </div>
          </button>

        </div>
      </BottomSheet>
    </>
  );
};
