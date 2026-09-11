import React from 'react';

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
  const sizeConfig: Record<string, string> = {
    sm: 'h-6 sm:h-7',
    md: 'h-7 sm:h-8',
    lg: 'h-9 sm:h-10',
    xl: 'h-11 sm:h-12',
  };

  const imgHeight = sizeConfig[size];

  // Logo officiel — fond noir retiré via mix-blend-mode multiply
  // fonctionne sur fond blanc ou très clair
  const logoImage = (
    <div className="flex items-center gap-2">
      <img
        src="/logo.png"
        alt="WealthFlow"
        className={`${imgHeight} w-auto max-w-full object-contain`}
        style={{ mixBlendMode: 'multiply' }}
      />
    </div>
  );

  // withDarkContainer gardé pour rétrocompatibilité mais on n'entoure plus d'un fond noir
  // car le logo doit s'afficher directement sur le fond de la page
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {logoImage}
    </div>
  );
};
