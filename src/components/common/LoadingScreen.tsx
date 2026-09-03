import React, { useEffect, useState } from 'react';
import { CheckCircle2, Cpu, Lock, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface LoadingScreenProps {
  onFinished?: () => void;
  minDurationMs?: number;
  message?: string;
  isOverlay?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onFinished,
  minDurationMs = 1500,
  message,
  isOverlay = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);

  const stages = [
    { text: 'Initialisation du coffre-fort...', icon: ShieldCheck },
    { text: 'Synchronisation des comptes & soldes...', icon: Zap },
    { text: 'Calcul des tirelires & budgets...', icon: Cpu },
    { text: 'Optimisation de l’expérience...', icon: Sparkles },
    { text: 'Prêt ! Bienvenue sur WealthFlow', icon: CheckCircle2 },
  ];

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min(100, Math.floor((elapsed / minDurationMs) * 100));
      setProgress(calculatedProgress);

      const currentStage = Math.min(
        stages.length - 1,
        Math.floor((calculatedProgress / 100) * stages.length)
      );
      setStageIndex(currentStage);

      if (calculatedProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (onFinished) {
            onFinished();
          }
        }, 200);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [minDurationMs, onFinished]);

  const CurrentIcon = stages[stageIndex]?.icon || ShieldCheck;

  return (
    <div
      id="loading-screen"
      className={`${
        isOverlay ? 'fixed inset-0 z-50' : 'fixed inset-0 z-50'
      } bg-[#0E0E10] text-white flex flex-col items-center justify-between p-6 select-none overflow-hidden`}
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FF5330]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="relative z-10 pt-4 flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[11px] font-semibold text-white/80 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span>FINTECH ENGINE • SECURE 256-BIT</span>
        </div>
      </div>

      {/* Center Brand Identity & Progress */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xs w-full space-y-6 -mt-8">
        {/* Animated Brand Container */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-[#FF5330] to-[#FF8A65] rounded-3xl blur-md opacity-40 group-hover:opacity-60 transition duration-500 animate-pulse" />
          <div className="relative">
            <BrandLogo size="xl" showBadge={true} withDarkContainer={true} className="shadow-2xl border border-white/20" />
          </div>
        </div>

        {/* Dynamic Step Title */}
        <div className="space-y-1.5 min-h-[52px]">
          <h2 className="text-base font-black tracking-tight text-white flex items-center justify-center gap-2">
            <CurrentIcon className="w-4 h-4 text-[#FF5330] animate-spin-slow" />
            <span>{message || stages[stageIndex]?.text}</span>
          </h2>
          <p className="text-xs text-white/50 font-medium">
            Votre gestion financière personnelle en temps réel
          </p>
        </div>

        {/* Progress Bar & Numerical Indicator */}
        <div className="w-full space-y-2">
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10 backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-[#FF5330] via-[#FF7A50] to-[#10B981] rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(255,83,48,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-white/60 num-tabular px-0.5">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Chargement</span>
            <span className="text-[#FF5330]">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 pb-4 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3 text-[11px] text-white/40">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#10B981]" />
            <span>Chiffrement local AES</span>
          </span>
          <span>•</span>
          <span>WealthFlow v2.4</span>
        </div>

        {/* Fast Skip button for impatient testing */}
        {progress > 20 && onFinished && (
          <button
            onClick={onFinished}
            className="text-[11px] font-medium text-white/50 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
          >
            Accéder directement
          </button>
        )}
      </div>
    </div>
  );
};
