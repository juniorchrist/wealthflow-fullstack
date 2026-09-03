import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  withDarkContainer?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showBadge = false,
  withDarkContainer = true,
}) => {
  const sizeConfig = {
    sm: 'h-6 sm:h-7',
    md: 'h-7 sm:h-8',
    lg: 'h-9 sm:h-10',
    xl: 'h-11 sm:h-12',
  };

  const imgHeight = sizeConfig[size];

  const logoImage = (
    <div className="flex items-center gap-2">
      <img
        src="/LOGOwealthflow.png"
        alt="WealthFlow - Gestion de Finance"
        referrerPolicy="no-referrer"
        className={`${imgHeight} w-auto max-w-full object-contain transition-transform`}
      />
      {showBadge && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-[#FF5330] text-white tracking-wider flex-shrink-0">
          PRO
        </span>
      )}
    </div>
  );

  if (withDarkContainer) {
    return (
      <div
        className={`inline-flex items-center justify-between bg-[#121214] border border-[#27272A] px-3 py-2 rounded-xl shadow-2xs ${className}`}
      >
        {logoImage}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {logoImage}
    </div>
  );
};



