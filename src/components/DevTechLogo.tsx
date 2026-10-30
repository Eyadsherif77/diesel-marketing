import React from 'react';

interface DevTechLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const DevTechLogo: React.FC<DevTechLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 34,
    md: 44,
    lg: 56,
  };

  const textSizes = {
    sm: '1.25rem',
    md: '1.55rem',
    lg: '2.1rem',
  };

  const currentIconSize = iconSizes[size];

  return (
    <div className={`dt-brand-logo-root ${className}`}>
      <div className="dt-brand-icon-box" style={{ width: 'auto', height: currentIconSize, display: 'flex', alignItems: 'center' }}>
        <img
          src="/logo.png"
          alt="DevTech Logo"
          className="lp-nav-logo-img"
          style={{
            height: currentIconSize,
            width: 'auto',
            maxHeight: currentIconSize,
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        />
      </div>

      <div className="dt-brand-text-col">
        <span className="dt-brand-name" style={{ fontSize: textSizes[size] }}>
          Dev<span className="dt-brand-highlight">Tech</span>
        </span>
        {showSubtitle && (
          <span className="dt-brand-tagline">
            Digital Future, Engineered
          </span>
        )}
      </div>
    </div>
  );
};
