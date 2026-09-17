import React, { useState } from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  withDarkContainer?: boolean;
  useOfficialLogo?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showBadge = false,
  withDarkContainer = false,
  useOfficialLogo = true,
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeConfig: Record<string, { height: string; iconSize: string; text: string }> = {
    sm: { height: 'h-6 sm:h-7', iconSize: 'w-6 h-6', text: 'text-sm sm:text-base font-bold' },
    md: { height: 'h-7 sm:h-8', iconSize: 'w-7 h-7', text: 'text-base sm:text-lg font-bold' },
    lg: { height: 'h-9 sm:h-10', iconSize: 'w-8 h-8', text: 'text-lg sm:text-xl font-bold' },
    xl: { height: 'h-11 sm:h-12', iconSize: 'w-10 h-10', text: 'text-xl sm:text-2xl font-bold' },
  };

  const cfg = sizeConfig[size] || sizeConfig.md;

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {!imgError ? (
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="WealthFlow"
            className={`${cfg.height} w-auto max-w-full object-contain`}
            style={{ mixBlendMode: 'multiply' }}
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        /* Fallback élégant et moderne si le fichier image est absent */
        <div className="flex items-center gap-2">
          <div className={`${cfg.iconSize} rounded-xl bg-gradient-to-tr from-[#18181B] to-[#3F3F46] flex items-center justify-center text-white shadow-sm font-black`}>
            W
          </div>
          <span className={`${cfg.text} tracking-tight text-[#18181B]`}>
            Wealth<span className="text-[#3b82f6]">Flow</span>
          </span>
        </div>
      )}
    </div>
  );
};
