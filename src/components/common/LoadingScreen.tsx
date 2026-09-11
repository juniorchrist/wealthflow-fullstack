import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min(100, Math.floor((elapsed / minDurationMs) * 100));
      setProgress(calculatedProgress);

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

  return (
    <div
      id="loading-screen"
      className={`${
        isOverlay ? 'fixed inset-0 z-50' : 'fixed inset-0 z-50'
      } bg-[#FFFFFF] flex flex-col items-center justify-center p-6 select-none`}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Official Logo */}
        <div className="flex justify-center mb-2">
          <BrandLogo size="lg" showBadge={false} withDarkContainer={false} useOfficialLogo={true} />
        </div>

        {/* Loading Message */}
        <p className="text-sm text-[#6F6F73] font-medium">
          {message || 'Chargement de votre espace...'}
        </p>

        {/* Simple Progress Bar */}
        <div className="w-48 sm:w-60">
          <div className="w-full h-1 bg-[#E8E8E8] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF5330] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
