import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type ThemeMode } from '../context/ThemeContext';

interface ThemeSwitcherProps {
  variant?: 'compact' | 'expanded';
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ variant = 'compact', className = '' }) => {
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'light', label: 'Light', icon: <Sun size={14} className="dt-theme-icon" /> },
    { mode: 'dark', label: 'Dark', icon: <Moon size={14} className="dt-theme-icon" /> },
    { mode: 'system', label: 'System', icon: <Monitor size={14} className="dt-theme-icon" /> },
  ];

  if (variant === 'expanded') {
    return (
      <div className={`dt-theme-switcher-expanded ${className}`} role="group" aria-label="Appearance Theme Selection">
        <span className="dt-theme-expanded-label">Appearance</span>
        <div className="dt-theme-pills">
          {options.map((opt) => {
            const isActive = themeMode === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                onClick={() => setThemeMode(opt.mode)}
                className={`dt-theme-pill-btn ${isActive ? 'active' : ''}`}
                aria-pressed={isActive}
                title={`Switch to ${opt.label} mode`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Compact segmented toggle for desktop navbar
  return (
    <div
      className={`dt-theme-switcher-compact ${className}`}
      role="group"
      aria-label="Theme mode switcher"
      title={`Current: ${themeMode} (${resolvedTheme})`}
    >
      <div className="dt-theme-track">
        {options.map((opt) => {
          const isActive = themeMode === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              onClick={() => setThemeMode(opt.mode)}
              className={`dt-theme-btn ${isActive ? 'active' : ''}`}
              aria-pressed={isActive}
              aria-label={`Select ${opt.label} theme`}
              title={`${opt.label} theme`}
            >
              {opt.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
};
