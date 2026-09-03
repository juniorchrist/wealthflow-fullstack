import React, { useState } from 'react';
import {
  CheckCircle2,
  Delete,
  Eye,
  EyeOff,
  Fingerprint,
  HelpCircle,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useWealth } from '../../context/WealthContext';

export const LockScreen: React.FC = () => {
  const { unlockWithPin, userProfile, updateUserProfile, triggerConfetti } = useWealth();
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBiometricScanning, setIsBiometricScanning] = useState<boolean>(false);
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
          } else {
            triggerConfetti();
          }
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleBiometricUnlock = () => {
    setIsBiometricScanning(true);
    setErrorMsg(null);
    setTimeout(() => {
      setIsBiometricScanning(false);
      unlockWithPin(userProfile.pinCode || '1234');
      triggerConfetti();
    }, 800);
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
      className="fixed inset-0 z-50 bg-[#0E0E10]/98 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-in fade-in duration-300"
    >
      {/* Subtle Ambient Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#FF5330]/8 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="relative z-10 pt-2 flex items-center justify-between w-full max-w-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/70">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span>SESSION SÉCURISÉE</span>
        </div>

        <button
          onClick={() => setIsForgotModalOpen(true)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Aide</span>
        </button>
      </div>

      {/* Main Center Content */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center space-y-4 my-auto">
        {/* Brand Logo */}
        <BrandLogo size="lg" showBadge={false} withDarkContainer={true} className="shadow-2xl border border-white/10" />

        {/* User Identity */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF5330] to-[#FF8A65] flex items-center justify-center text-[10px] font-black text-white">
            {userInitial}
          </div>
          <span className="text-xs font-bold text-white/90 truncate max-w-[140px]">
            {userProfile.name}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
        </div>

        <div className="space-y-0.5">
          <h2 className="text-lg font-black text-white tracking-tight">
            Application verrouillée
          </h2>
          <p className="text-xs text-white/50 font-medium">
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
                    ? 'bg-[#FF5330] scale-110 shadow-[0_0_10px_rgba(255,83,48,0.6)]'
                    : 'bg-white/15 border border-white/25'
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
              className="w-16 h-14 sm:w-[72px] sm:h-[60px] rounded-2xl bg-white/8 hover:bg-white/15 active:bg-[#FF5330] active:text-white border border-white/8 text-white font-extrabold text-xl flex items-center justify-center transition-all duration-150 cursor-pointer shadow-sm active:scale-90"
            >
              {digit}
            </button>
          ))}

          {/* Bottom row: Biometric, 0, Backspace */}
          <button
            onClick={handleBiometricUnlock}
            disabled={isBiometricScanning}
            className={`w-16 h-14 sm:w-[72px] sm:h-[60px] rounded-2xl bg-[#FF5330]/15 hover:bg-[#FF5330]/25 border border-[#FF5330]/30 text-[#FF5330] flex flex-col items-center justify-center transition-all cursor-pointer active:scale-90 ${
              isBiometricScanning ? 'animate-pulse' : ''
            }`}
            title="Déverrouillage biométrique"
          >
            <Fingerprint className="w-5 h-5" />
            <span className="text-[8px] font-bold mt-0.5">Biométrie</span>
          </button>

          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-14 sm:w-[72px] sm:h-[60px] rounded-2xl bg-white/8 hover:bg-white/15 active:bg-[#FF5330] active:text-white border border-white/8 text-white font-extrabold text-xl flex items-center justify-center transition-all duration-150 cursor-pointer shadow-sm active:scale-90"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            className="w-16 h-14 sm:w-[72px] sm:h-[60px] rounded-2xl bg-white/8 hover:bg-white/15 active:scale-90 border border-white/8 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Effacer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Helper */}
        <div className="pt-2 text-center">
          <p className="text-[11px] text-white/40 font-medium">
            Code PIN par défaut : <strong className="text-[#FF5330] font-bold">1234</strong>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 pb-2 text-center">
        <p className="text-[10px] text-white/30">
          Chiffrement local AES-256 • WealthFlow
        </p>
      </div>

      {/* Forgot PIN Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-white/15 rounded-2xl max-w-sm w-full p-5 text-white space-y-4 text-left shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#FF5330]" />
                <h3 className="text-sm font-black text-white">Récupération du Code PIN</h3>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              Vos identifiants restent stockés localement sur votre appareil.
              Vous pouvez réinitialiser votre code PIN sur la valeur d'origine.
            </p>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[11px] text-white/50">Code par défaut :</p>
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
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleResetPinToDefault}
                  className="flex-1 py-2 rounded-xl bg-[#FF5330] hover:bg-[#E84524] text-white font-bold text-xs shadow-xs cursor-pointer"
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
