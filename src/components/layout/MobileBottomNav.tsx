import React, { useState } from 'react';
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  LayoutDashboard,
  Lightbulb,
  Menu,
  PieChart,
  PiggyBank,
  Plus,
  Settings,
  ShieldCheck,
  Tags,
  X,
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { ActiveTab } from '../../types';
import { BottomSheet } from '../common/BottomSheet';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsNewTransactionModalOpen, notifications } = useWealth();
  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Tools & Analyses Mobile Drawer */}
      {isToolsDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl p-6 shadow-2xl border-t border-[#E8E8E8] space-y-5 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E8]">
              <div>
                <h3 className="font-extrabold text-lg text-[#18181B]">Menu & Outils</h3>
                <p className="text-xs text-[#6F6F73]">Accédez à vos analyses, stratégies et réglages</p>
              </div>
              <button
                onClick={() => setIsToolsDrawerOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#52525B] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold tracking-wider text-[#A1A1AA] uppercase mb-2">
                  OUTILS & ANALYSES
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('analytics');
                      setIsToolsDrawerOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center space-y-1.5 transition-all cursor-pointer ${
                      activeTab === 'analytics'
                        ? 'bg-[#FF5330]/10 border-[#FF5330] text-[#FF5330]'
                        : 'bg-[#F7F7F7] border-[#E8E8E8] text-[#18181B]'
                    }`}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-xs font-bold">Analyses</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('strategy');
                      setIsToolsDrawerOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center space-y-1.5 transition-all cursor-pointer ${
                      activeTab === 'strategy'
                        ? 'bg-[#FF5330]/10 border-[#FF5330] text-[#FF5330]'
                        : 'bg-[#F7F7F7] border-[#E8E8E8] text-[#18181B]'
                    }`}
                  >
                    <Lightbulb className="w-5 h-5" />
                    <span className="text-xs font-bold">Stratégie</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('categories');
                      setIsToolsDrawerOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center space-y-1.5 transition-all cursor-pointer ${
                      activeTab === 'categories'
                        ? 'bg-[#FF5330]/10 border-[#FF5330] text-[#FF5330]'
                        : 'bg-[#F7F7F7] border-[#E8E8E8] text-[#18181B]'
                    }`}
                  >
                    <Tags className="w-5 h-5" />
                    <span className="text-xs font-bold">Catégories</span>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold tracking-wider text-[#A1A1AA] uppercase mb-2">
                  GESTION & SÉCURITÉ
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('notifications');
                      setIsToolsDrawerOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center space-y-1.5 transition-all cursor-pointer relative ${
                      activeTab === 'notifications'
                        ? 'bg-[#FF5330]/10 border-[#FF5330] text-[#FF5330]'
                        : 'bg-[#F7F7F7] border-[#E8E8E8] text-[#18181B]'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="text-xs font-bold">Alertes</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF5330]" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setIsToolsDrawerOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center space-y-1.5 transition-all cursor-pointer ${
                      activeTab === 'settings'
                        ? 'bg-[#FF5330]/10 border-[#FF5330] text-[#FF5330]'
                        : 'bg-[#F7F7F7] border-[#E8E8E8] text-[#18181B]'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="text-xs font-bold">Réglages</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('security');
                      setIsToolsDrawerOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center space-y-1.5 transition-all cursor-pointer ${
                      activeTab === 'security'
                        ? 'bg-[#FF5330]/10 border-[#FF5330] text-[#FF5330]'
                        : 'bg-[#F7F7F7] border-[#E8E8E8] text-[#18181B]'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-bold">Sécurité</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Liquid Glass Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-nav"
        className="lg:hidden fixed bottom-4 left-0 right-0 z-40 px-3 flex justify-center pointer-events-none"
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0 8px 28px rgba(24, 24, 27, 0.10)',
          }}
          className="flex items-center justify-between px-3 py-2 rounded-full pointer-events-auto max-w-sm w-full gap-1"
        >
          {/* Item 1: Accueil */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'dashboard' ? 'text-[#FF5330]' : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">Accueil</span>
          </button>

          {/* Item 2: Activité */}
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'transactions' ? 'text-[#FF5330]' : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <ArrowLeftRight className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">Activité</span>
          </button>

          {/* Center FAB: Add Transaction */}
          <button
            id="mobile-fab-add"
            onClick={() => setIsNewTransactionModalOpen(true)}
            className="w-12 h-12 rounded-full bg-[#FF5330] hover:bg-[#E84524] active:scale-90 text-white flex items-center justify-center shadow-md transition-all cursor-pointer -mt-4 mx-1 flex-shrink-0"
            title="Nouvelle transaction"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Item 3: Budget */}
          <button
            onClick={() => setActiveTab('budget')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'budget' ? 'text-[#FF5330]' : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <PieChart className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">Budget</span>
          </button>

          {/* Item 4: Épargne */}
          <button
            onClick={() => setActiveTab('savings')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'savings' ? 'text-[#FF5330]' : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <PiggyBank className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">Épargne</span>
          </button>

          {/* Item 5: More Menu (Analyses/Strategy) */}
          <button
            onClick={() => setIsToolsDrawerOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition-all cursor-pointer ${
              ['analytics', 'strategy', 'categories', 'notifications', 'settings', 'security'].includes(activeTab)
                ? 'text-[#FF5330]'
                : 'text-[#71717A] hover:text-[#18181B]'
            }`}
            title="Menu & Outils"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
};
