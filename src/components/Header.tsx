import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, History, Palette, Sparkles } from 'lucide-react';
import { THEMES } from '../constants/themes';
import { ThemeConfig } from '../types';

interface HeaderProps {
  currentThemeId: string;
  onThemeChange: (theme: ThemeConfig) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentThemeId,
  onThemeChange,
  soundEnabled,
  onToggleSound,
  onOpenHistory,
}) => {
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTheme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];

  return (
    <header className="w-full max-w-5xl mx-auto pt-6 pb-4 px-4 flex items-center justify-between border-b border-white/5">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-theme-main/10 border border-theme-main/30 flex items-center justify-center text-theme-main shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all hover:scale-105">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm0 2v8h16V8H4zm2 2h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM6 13h12v2H6v-2z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Type<span className="text-theme-main">Flow</span>
            </h1>
            <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-theme-sub border border-white/10">
              v1.0
            </span>
          </div>
          <p className="text-xs text-theme-sub hidden sm:block">Minimalist & Precision Typing Engine</p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? "Mute Mechanical Audio" : "Enable Mechanical Audio"}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-200 border ${
            soundEnabled
              ? 'bg-white/5 text-theme-main border-theme-main/30 hover:bg-theme-main/10'
              : 'bg-transparent text-theme-sub border-white/5 hover:border-white/20 hover:text-white'
          }`}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span className="hidden md:inline">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
        </button>

        {/* History / Stats Modal Trigger */}
        <button
          onClick={onOpenHistory}
          title="View Past Tests & Personal Bests"
          className="p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-white/5 text-theme-sub border border-white/10 hover:border-white/20 hover:text-white transition-all"
        >
          <History size={16} />
          <span className="hidden md:inline">History</span>
        </button>

        {/* Theme Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="p-2 rounded-lg text-xs font-medium flex items-center gap-2 bg-white/5 text-white border border-white/10 hover:border-theme-main/40 transition-all"
            title="Change Theme Palette"
          >
            <Palette size={16} className="text-theme-main" />
            <span className="hidden sm:inline">{currentTheme.name}</span>
            <div
              className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20"
              style={{ backgroundColor: currentTheme.colors.main }}
            />
          </button>

          {themeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#141822] border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-theme-sub flex items-center gap-1 border-b border-white/5 mb-1">
                <Sparkles size={12} /> Color Palettes
              </div>
              <div className="space-y-0.5">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      onThemeChange(theme);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      theme.id === currentThemeId
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-theme-sub hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{theme.name}</span>
                    <div className="flex items-center gap-1">
                      <span
                        className="w-3 h-3 rounded-full border border-black/50"
                        style={{ backgroundColor: theme.colors.main }}
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-black/50"
                        style={{ backgroundColor: theme.colors.bg }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
