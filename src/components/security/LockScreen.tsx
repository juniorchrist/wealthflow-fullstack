import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Delete,
  Fingerprint,
  HelpCircle,
  KeyRound,
  ShieldCheck,
  X,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useWealth } from '../../context/WealthContext';

export const LockScreen: React.FC = () => {
  const { unlockWithPin, userProfile, logout } = useWealth();
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState<boolean>(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState<boolean>(false);

  // Gestion de la saisie au pavé ou au clavier physique
  const handleKeyPress = (digit: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setErrorMsg(null);

      if (nextPin.length === 4) {
        setTimeout(() => {
          const success = unlockWithPin(nextPin);
          if (!success) {
            setErrorMsg('Code PIN incorrect. Veuillez réessayer.');
            setPinInput('');
          }
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  // Support du clavier physique sur ordinateur
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isForgotModalOpen) return;
      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinInput, isForgotModalOpen]);

  const handleBiometricUnlock = () => {
    if (!userProfile.pinCode) return;
    setIsBiometricScanning(true);
    setTimeout(() => {
      setIsBiometricScanning(false);
      unlockWithPin(userProfile.pinCode);
    }, 600);
  };

  const userInitial = userProfile.name
    ? userProfile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'WF';

  return (
    <div
      id="lock-screen"
      className="fixed inset-0 z-50 bg-[#FFFFFF] flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-in fade-in duration-300"
    >
      {/* Top Header */}
      <div className="relative z-10 pt-2 flex items-center justify-between w-full max-w-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F7F7F7] border border-[#E8E8E8] text-[10px] font-bold text-[#6F6F73]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span>SESSION SÉCURISÉE</span>
        </div>

        <button
          onClick={() => setIsForgotModalOpen(true)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6F6F73] transition-colors cursor-pointer hover:text-[#FF5330]"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Aide</span>
        </button>
      </div>

      {/* Main Center Content */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center space-y-4 my-auto">
        {/* Brand Logo */}
        <BrandLogo size="lg" showBadge={false} withDarkContainer={false} useOfficialLogo={true} />

        {/* User Identity */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F7F7F7] border border-[#E8E8E8]">
          <div className="w-6 h-6 rounded-full bg-[#18181B] flex items-center justify-center text-[10px] font-bold text-white">
            {userInitial}
          </div>
          <span className="text-xs font-bold text-[#18181B] truncate max-w-[140px]">
            {userProfile.name}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
        </div>

        <div className="space-y-0.5">
          <h2 className="text-lg font-black text-[#18181B] tracking-tight">
            Application verrouillée
          </h2>
          <p className="text-xs text-[#6F6F73] font-medium">
            Entrez votre code PIN à 4 chiffres
          </p>
        </div>

        {/* 4-dot PIN Indicator */}
        <div className="flex items-center justify-center space-x-3 my-2">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < pinInput.length;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-[#FF5330] scale-110 shadow-[0_0_8px_rgba(255,83,48,0.5)]'
                    : 'bg-[#E8E8E8] border border-[#D4D4D8]'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <p className="text-xs font-bold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 px-3 py-1.5 rounded-lg animate-shake">
            {errorMsg}
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[260px] pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="w-16 h-14 sm:w-[72px] sm:h-[60px] rounded-2xl bg-[#F7F7F7] hover:bg-[#EFEFEF] active:bg-[#FF5330] active:text-white border border-[#E8E8E8] text-[#18181B] font-extrabold text-xl flex items-center justify-center transition-all duration-150 cursor-pointer shadow-2xs active:scale-90"
            >
              {digit}
            </button>
          ))}

          {/* Bottom row: 0, Backspace */}

          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-14 sm:w-[72px] sm:h-[60px] rounded-2xl bg-[#F7F7F7] hover:bg-[#EFEFEF] active:bg-[#FF5330] active:text-white border border-[#E8E8E8] text-[#18181B] font-extrabold text-xl flex items-center justify-center transition-all duration-150 cursor-pointer shadow-2xs active:scale-90"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            className="w-16 h-14 sm:w-[72px] sm:h-[60px] rounded-2xl bg-[#F7F7F7] hover:bg-[#EFEFEF] active:scale-90 border border-[#E8E8E8] text-[#6F6F73] hover:text-[#18181B] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Effacer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Helper */}
        <div className="pt-2 text-center">
          <p className="text-[11px] text-[#6F6F73] font-medium">
            Entrez votre mot de passe à 4 chiffres
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 pb-2 text-center">
        <p className="text-[10px] text-[#A1A1AA]">
          Chiffrement local AES-256 • WealthFlow
        </p>
      </div>

      {/* Forgot PIN Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#FFFFFF] border border-[#E8E8E8] rounded-2xl max-w-sm w-full p-5 text-[#18181B] space-y-4 text-left shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#FF5330]" />
                <h3 className="text-sm font-black text-[#18181B]">Code de déverrouillage</h3>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-[#F7F7F7] flex items-center justify-center text-[#6F6F73] cursor-pointer hover:bg-[#E8E8E8] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6F6F73] leading-relaxed">
              Le code de déverrouillage correspond exactement au mot de passe à 4 chiffres défini lors de la création de votre compte.
            </p>

            <p className="text-xs text-[#6F6F73] leading-relaxed">
              Si vous avez oublié votre code, vous pouvez vous déconnecter pour vous reconnecter avec votre adresse e-mail.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setIsForgotModalOpen(false);
                  logout();
                }}
                className="w-full py-2.5 rounded-xl bg-[#FF5330] text-white font-bold text-xs shadow-xs cursor-pointer hover:bg-[#e04420] transition-colors"
              >
                Se déconnecter de la session
              </button>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="w-full py-2 rounded-xl bg-[#F7F7F7] text-[#6F6F73] hover:text-[#18181B] font-bold text-xs cursor-pointer hover:bg-[#E8E8E8] transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};