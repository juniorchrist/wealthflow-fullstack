import React, { useState } from 'react';
import {
  CheckCircle2,
  Delete,
  KeyRound,
  X,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useWealth } from '../../context/WealthContext';

export const LockScreen: React.FC = () => {
  const { unlockWithPin, userProfile, updateUserProfile } = useWealth();
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState<boolean>(false);
  const [isResetSuccess, setIsResetSuccess] = useState<boolean>(false);

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

  const handleResetPinToDefault = () => {
    updateUserProfile({ pinCode: '1234' });
    setIsResetSuccess(true);
    setTimeout(() => {
      setIsResetSuccess(false);
      setIsForgotModalOpen(false);
      setPinInput('');
      setErrorMsg(null);
    }, 1500);
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
          <span>SESSION SÉCURISÉE</span>
        </div>

        <button
          onClick={() => setIsForgotModalOpen(true)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6F6F73] transition-colors cursor-pointer"
        >
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
                    ? 'bg-[#FF5330] scale-110'
                    : 'bg-[#E8E8E8] border border-[#D4D4D8]'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <p className="text-xs font-bold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 px-3 py-1.5 rounded-lg">
            {errorMsg}
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[260px] pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="w-16 h-14 sm:w-[72px] sm:h-[60px] rounded-2xl bg-[#F7F7F7] active:bg-[#FF5330] active:text-white border border-[#E8E8E8] text-[#18181B] font-extrabold text-xl flex items-center justify-center transition-all duration-150 cursor-pointer shadow-sm active:scale-90"
            >
              {digit}
            </button>
          ))}

          {/* Bottom row: Backspace, 0, Empty */}
          <button
            onClick={handleBackspace}
            className="w-16 h-14 sm:w-[72px] sm:h-[60px] rounded-2xl bg-[#F7F7F7] active:scale-90 border border-[#E8E8E8] text-[#6F6F73] flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Effacer"
          >
            <Delete className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-14 sm:w-[72px] sm:h-[60px] rounded-2xl bg-[#F7F7F7] active:bg-[#FF5330] active:text-white border border-[#E8E8E8] text-[#18181B] font-extrabold text-xl flex items-center justify-center transition-all duration-150 cursor-pointer shadow-sm active:scale-90"
          >
            0
          </button>

          <div />
        </div>

        {/* Demo Helper */}
        <div className="pt-2 text-center">
          <p className="text-[11px] text-[#6F6F73] font-medium">
            Code PIN par défaut : <strong className="text-[#FF5330] font-bold">1234</strong>
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E8E8E8] rounded-2xl max-w-sm w-full p-5 text-[#18181B] space-y-4 text-left shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#FF5330]" />
                <h3 className="text-sm font-black text-[#18181B]">Récupération du Code PIN</h3>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-[#F7F7F7] flex items-center justify-center text-[#6F6F73] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6F6F73] leading-relaxed">
              Vos identifiants restent stockés localement sur votre appareil.
              Vous pouvez réinitialiser votre code PIN sur la valeur d'origine.
            </p>

            <div className="p-3 rounded-xl bg-[#F7F7F7] border border-[#E8E8E8] space-y-1">
              <p className="text-[11px] text-[#6F6F73]">Code par défaut :</p>
              <p className="text-sm font-black text-[#FF5330] tracking-wider">1234</p>
            </div>

            {isResetSuccess ? (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Code PIN réinitialisé à 1234 !</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setIsForgotModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-[#F7F7F7] text-[#18181B] font-bold text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleResetPinToDefault}
                  className="flex-1 py-2 rounded-xl bg-[#FF5330] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Réinitialiser (1234)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};