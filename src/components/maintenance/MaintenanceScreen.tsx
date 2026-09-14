import React, { useState } from 'react';
import { AlertTriangle, Clock, Headphones, RefreshCw, Shield, Wrench } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { AdminLoginModal } from '../admin/AdminLoginModal';
import { useWealth } from '../../context/WealthContext';

interface MaintenanceScreenProps {
  message?: string;
  onRefresh?: () => void;
  onOpenHelp?: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  message,
  onRefresh,
  onOpenHelp,
}) => {
  const { setActiveTab } = useWealth();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const defaultMessage =
    "WealthFlow fait l'objet d'une opération de maintenance programmée afin d'améliorer la rapidité et la sécurité de vos services financiers. Nous revenons très prochainement !";

  const handleRefresh = () => {
    setIsChecking(true);
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
    setTimeout(() => setIsChecking(false), 1200);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-in fade-in duration-300">
      
      {/* Top bar */}
      <div className="w-full max-w-2xl flex items-center justify-between pt-2">
        <BrandLogo size="md" />
        <button
          onClick={() => setIsAdminModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E8E8E8] text-[11px] font-bold text-[#71717A] hover:text-[#18181B] hover:border-[#18181B] transition-colors cursor-pointer shadow-2xs"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Accès Administrateur</span>
        </button>
      </div>

      {/* Center Card */}
      <div className="w-full max-w-lg my-auto py-8">
        <div className="rounded-3xl bg-white border border-[#E8E8E8] p-6 sm:p-8 shadow-sm text-center space-y-6">
          
          {/* Animated Icon */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-18 h-18 rounded-3xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shadow-inner">
              <Wrench className="w-9 h-9 animate-bounce" style={{ animationDuration: '2.5s' }} />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#EF4444] border-2 border-white flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            </span>
          </div>

          {/* Titles */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[11px] font-bold text-[#B91C1C]">
              <Clock className="w-3.5 h-3.5" />
              <span>Intervention Technique en cours</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
              Maintenance Programmée
            </h1>
          </div>

          {/* Message de l'administrateur */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F7F7] border border-[#E8E8E8] text-xs sm:text-sm text-[#3F3F46] leading-relaxed text-left">
            <p className="font-semibold text-[#18181B] mb-1 flex items-center gap-1.5">
              <span>Message de l'administration :</span>
            </p>
            <p className="italic">
              « {message || defaultMessage} »
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRefresh}
              disabled={isChecking}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Vérification...' : 'Vérifier la disponibilité'}</span>
            </button>

            <button
              onClick={() => {
                if (onOpenHelp) {
                  onOpenHelp();
                } else {
                  setActiveTab('help-center');
                }
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F7F7F7] hover:bg-[#EAEAEA] border border-[#E8E8E8] text-xs font-bold text-[#18181B] flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Headphones className="w-3.5 h-3.5 text-[#52525B]" />
              <span>Centre d'aide & Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center py-2 text-[11px] text-[#A1A1AA]">
        Vos données financières et transactions restent strictement protégées et en sécurité.
      </div>

      {/* Modale connexion admin pour pouvoir débloquer la maintenance */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
};
