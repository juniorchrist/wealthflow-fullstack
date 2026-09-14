import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  X,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useWealth } from '../../context/WealthContext';

export const LockScreen: React.FC = () => {
  const { unlockWithPin, userProfile, logout } = useWealth();
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus automatiquement le champ au montage
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) return;

    const success = unlockWithPin(passwordInput);
    if (success) {
      setIsSuccess(true);
    } else {
      setErrorMsg('Mot de passe incorrect. Veuillez réessayer.');
      setPasswordInput('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
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
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6F6F73] transition-colors cursor-pointer hover:text-[#FF5330]"
        >
          <span>Aide</span>
        </button>
      </div>

      {/* Main Center Content */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center space-y-5 my-auto">
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
            Entrez votre mot de passe pour déverrouiller
          </p>
        </div>

        {/* Password Input Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <div className="relative">
            <Lock className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setErrorMsg(null);
              }}
              className={`w-full pl-10 pr-10 py-3 bg-[#FAFAFA] border rounded-xl text-sm font-semibold text-[#18181B] focus:outline-none transition-colors ${
                errorMsg
                  ? 'border-[#EF4444] focus:border-[#EF4444]'
                  : 'border-[#E8E8E8] focus:border-[#FF5330]'
              }`}
              placeholder="Mot de passe"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#6F6F73] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 px-3 py-1.5 rounded-lg text-left">
              {errorMsg}
            </p>
          )}

          {isSuccess && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Déverrouillage réussi !</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!passwordInput || isSuccess}
            className="w-full py-3 rounded-xl bg-[#FF5330] text-white font-bold text-sm shadow-sm hover:bg-[#e04420] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Déverrouiller
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="relative z-10 pb-2 text-center">
        <p className="text-[10px] text-[#A1A1AA]">
          Chiffrement local AES-256 • WealthFlow
        </p>
      </div>

      {/* Aide / Mot de passe oublié Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E8E8E8] rounded-2xl max-w-sm w-full p-5 text-[#18181B] space-y-4 text-left shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#FF5330]" />
                <h3 className="text-sm font-black text-[#18181B]">Mot de passe oublié ?</h3>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-[#F7F7F7] flex items-center justify-center text-[#6F6F73] cursor-pointer hover:bg-[#E8E8E8] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6F6F73] leading-relaxed">
              Votre mot de passe de verrouillage est le même que celui utilisé lors de votre
              inscription. Si vous ne vous en souvenez plus, vous pouvez vous déconnecter et
              vous reconnecter.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-[#F7F7F7] text-[#18181B] font-bold text-xs cursor-pointer hover:bg-[#E8E8E8] transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setIsForgotModalOpen(false);
                  logout();
                }}
                className="flex-1 py-2 rounded-xl bg-[#FF5330] text-white font-bold text-xs shadow-sm cursor-pointer hover:bg-[#e04420] transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};