import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Unlock,
  Delete,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';

interface SecurityLockViewProps {
  user: UserProfile;
  onUnlock: () => void;
  onResetAccount?: () => void;
}

export const SecurityLockView: React.FC<SecurityLockViewProps> = ({
  user,
  onUnlock,
  onResetAccount,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleDigitPress = (digit: string) => {
    if (isSuccess || isVerifying) return;
    setError(null);
    if (pin.length < 12) {
      const nextPin = pin + digit;
      setPin(nextPin);

      // Auto verify at 4 digits
      if (nextPin.length >= 4 && nextPin.length <= 8) {
        // Can verify or let user continue
      }
    }
  };

  const handleBackspace = () => {
    if (isSuccess || isVerifying) return;
    setError(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (isSuccess || isVerifying) return;
    setError(null);
    setPin('');
  };

  const verifyPin = async (pinToTest: string) => {
    if (!pinToTest || isVerifying) return;
    setIsVerifying(true);
    setError(null);

    try {
      // Check via server API
      const res = await authService.verifyPin(pinToTest);
      if (res.valid) {
        setIsSuccess(true);
        setError(null);
        setTimeout(() => {
          onUnlock();
        }, 300);
      } else {
        triggerError('Code PIN incorrect');
      }
    } catch (err: any) {
      // If offline / local fallback
      if (user.mdp && pinToTest === user.mdp) {
        setIsSuccess(true);
        setError(null);
        setTimeout(() => {
          onUnlock();
        }, 300);
      } else {
        triggerError(err.message || 'Code PIN incorrect');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const triggerError = (msg: string) => {
    setIsShaking(true);
    setError(msg);
    setTimeout(() => {
      setIsShaking(false);
      setPin('');
    }, 600);
  };

  const handleSubmitPin = () => {
    if (!pin) {
      setError('Code requis');
      return;
    }
    verifyPin(pin);
  };

  const getInitials = () => {
    const p = user.prenom ? user.prenom[0] : '';
    const n = user.nom ? user.nom[0] : '';
    return (p + n).toUpperCase() || 'WF';
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between items-center px-4 py-8 select-none antialiased relative overflow-hidden"
      style={{ background: 'var(--wf-bg)' }}
    >
      {/* Hidden input for keyboard */}
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        value={pin}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '');
          setPin(val);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmitPin();
          }
        }}
        className="opacity-0 absolute pointer-events-none -top-10"
        autoFocus
      />

      {/* Brand Header */}
      <header className="flex items-center gap-2.5 pt-4 mb-10 sm:mb-12 z-10">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
          style={{ background: 'var(--wf-primary)' }}
        >
          <span className="font-extrabold text-base tracking-tight">W</span>
        </div>
        <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--wf-text)' }}>
          Wealth<span style={{ color: 'var(--wf-primary)' }}>Flow</span>
        </span>
      </header>

      {/* Center Content : User Avatar + PIN Pad */}
      <main className="w-full max-w-[340px] flex flex-col items-center z-10">
        {/* User Card */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm mb-3 relative"
            style={{ background: 'var(--wf-primary)' }}
          >
            {getInitials()}
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px]"
              style={{
                background: isSuccess ? 'var(--wf-success)' : 'var(--wf-text)',
                border: '2px solid var(--wf-surface)',
              }}
            >
              {isSuccess ? <Unlock size={12} /> : <Lock size={12} />}
            </div>
          </div>

          <h2 className="text-base font-bold" style={{ color: 'var(--wf-text)' }}>
            {user.prenom} {user.nom}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--wf-text-secondary)' }}>
            Entrez votre code de sécurité
          </p>
        </div>

        {/* PIN Dots Display */}
        <div
          className={`flex items-center justify-center gap-3 my-4 ${
            isShaking ? 'animate-shake' : ''
          }`}
        >
          {[0, 1, 2, 3].map((index) => {
            const hasValue = pin.length > index;
            return (
              <div
                key={index}
                className="w-3.5 h-3.5 rounded-full transition-all duration-200"
                style={{
                  background: isSuccess
                    ? 'var(--wf-success)'
                    : hasValue
                    ? 'var(--wf-primary)'
                    : 'var(--wf-border)',
                  transform: hasValue ? 'scale(1.15)' : 'scale(1)',
                }}
              />
            );
          })}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs font-semibold mt-1 mb-3 animate-fadeIn" style={{ color: 'var(--wf-danger)' }}>
            {error}
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mt-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitPress(digit)}
              className="w-full aspect-square rounded-2xl text-lg font-bold flex items-center justify-center transition-all active:scale-95 touch-target shadow-sm"
              style={{
                background: 'var(--wf-surface)',
                border: '1px solid var(--wf-border)',
                color: 'var(--wf-text)',
              }}
            >
              {digit}
            </button>
          ))}

          {/* Bottom Row */}
          <button
            type="button"
            onClick={handleBackspace}
            className="w-full aspect-square rounded-2xl text-xs font-bold flex items-center justify-center transition-all active:scale-95 touch-target"
            style={{
              background: 'transparent',
              color: 'var(--wf-text-secondary)',
            }}
            aria-label="Effacer"
          >
            <Delete size={20} />
          </button>

          <button
            type="button"
            onClick={() => handleDigitPress('0')}
            className="w-full aspect-square rounded-2xl text-lg font-bold flex items-center justify-center transition-all active:scale-95 touch-target shadow-sm"
            style={{
              background: 'var(--wf-surface)',
              border: '1px solid var(--wf-border)',
              color: 'var(--wf-text)',
            }}
          >
            0
          </button>

          <button
            type="button"
            onClick={handleSubmitPin}
            disabled={isVerifying || pin.length === 0}
            className="w-full aspect-square rounded-2xl text-xs font-bold flex items-center justify-center transition-all active:scale-95 touch-target text-white shadow-sm"
            style={{
              background: 'var(--wf-primary)',
              opacity: pin.length === 0 ? 0.5 : 1,
            }}
            aria-label="Valider"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="w-full max-w-[340px] flex items-center justify-center pt-8 z-10">
        {onResetAccount && (
          <button
            type="button"
            onClick={onResetAccount}
            className="text-xs font-semibold flex items-center gap-1.5 transition-colors py-2 px-3 rounded-lg"
            style={{ color: 'var(--wf-text-tertiary)' }}
          >
            <LogOut size={14} />
            <span>Changer de compte</span>
          </button>
        )}
      </footer>
    </div>
  );
};