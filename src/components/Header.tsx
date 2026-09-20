import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, History, Palette, Sparkles, Maximize2, Minimize2, Trophy, User, Flame } from 'lucide-react';
import { THEMES } from '../constants/themes';
import { ThemeConfig, UserProfile } from '../types';
import { Identicon } from './Identicon';

interface HeaderProps {
  currentThemeId: string;
  onThemeChange: (theme: ThemeConfig) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHistory: () => void;
  onOpenLeaderboard: () => void;
  profile: UserProfile | null;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onResetToHome: () => void;
  dailyStreak?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentThemeId,
  onThemeChange,
  soundEnabled,
  onToggleSound,
  onOpenHistory,
  onOpenLeaderboard,
  profile,
  onOpenProfile,
  onOpenAuth,
  onResetToHome,
  dailyStreak = 0,
}) => {
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  // Monitor fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const currentTheme = THEMES.find((t) => t.id === currentThemeId) || THEMES[0];

  return (
    <header className="w-full px-4 sm:px-8 lg:px-12 py-3.5 sm:py-4 flex items-center justify-between border-b border-white/5 transition-all bg-[#0d1017]/40 backdrop-blur-md">
      {/* Brand Logo - Interactive Home Reset Button */}
      <button
        onClick={onResetToHome}
        title="TypeFlow Home — Click to return to original page"
        className="flex items-center gap-2.5 sm:gap-3 text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-main/50 rounded-xl p-1 -m-1 transition-all"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-theme-main/10 border border-theme-main/30 flex items-center justify-center text-theme-main shadow-[0_0_20px_rgba(16,185,129,0.15)] group-hover:scale-105 group-hover:border-theme-main/60 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm0 2v8h16V8H4zm2 2h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM6 13h12v2H6v-2z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5 group-hover:text-white/95">
              Type<span className="text-theme-main group-hover:brightness-110 transition-all">Flow</span>
            </h1>
            <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-theme-sub border border-white/10 hidden xs:inline-block">
              v1.2
            </span>
          </div>
          <p className="text-xs text-theme-sub hidden md:block">Precision Typing Engine &bull; Cloud Synced</p>
        </div>
      </button>

      {/* Action Controls & Top-Right Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Daily Streak Pill */}
        {dailyStreak > 0 && (
          <div
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400"
            title={`${dailyStreak}-day daily challenge streak!`}
          >
            <Flame size={14} className="animate-pulse" />
            <span className="text-xs font-bold font-mono">{dailyStreak}</span>
          </div>
        )}

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="p-2 rounded-lg text-xs font-medium text-theme-sub hover:text-white bg-white/5 border border-white/5 hover:border-white/20 transition-all hidden sm:flex items-center justify-center"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Mechanical Audio' : 'Enable Mechanical Audio'}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-200 border ${
            soundEnabled
              ? 'bg-white/5 text-theme-main border-theme-main/30 hover:bg-theme-main/10'
              : 'bg-transparent text-theme-sub border-white/5 hover:border-white/20 hover:text-white'
          }`}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span className="hidden lg:inline">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
        </button>

        {/* Community Leaderboard Trigger */}
        <button
          onClick={onOpenLeaderboard}
          title="View Community Leaderboards"
          className="p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-white/5 text-theme-sub border border-white/10 hover:border-white/20 hover:text-white transition-all"
        >
          <Trophy size={16} className="text-amber-400" />
          <span className="hidden md:inline">Leaderboard</span>
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

        {/* Visual Divider separating utilities from Profile */}
        <div className="h-6 w-px bg-white/10 mx-0.5 hidden xs:block" />

        {/* Dedicated Top-Right Corner Profile Section */}
        {profile ? (
          <button
            onClick={onOpenProfile}
            title="Personal Info & Profile Settings"
            className="p-1 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 bg-white/5 text-white border border-white/10 hover:border-theme-main/40 hover:bg-white/10 transition-all group"
          >
            {profile.customAvatar ? (
              <img
                src={profile.customAvatar}
                alt={profile.username}
                className="w-6 h-6 rounded-lg object-cover ring-1 ring-white/20 group-hover:ring-theme-main/50 transition-all"
              />
            ) : (
              <Identicon
                seed={profile.avatarSeed || profile.username}
                size={24}
                showBorder={false}
                className="rounded-lg"
              />
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-mono text-[11px] font-semibold max-w-[100px] truncate text-white leading-tight">
                @{profile.username}
              </span>
              <span className="text-[9px] text-theme-sub flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Profile
              </span>
            </div>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            title="Sign In or Create an Account"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 bg-theme-main/15 hover:bg-theme-main/25 text-white border border-theme-main/40 hover:border-theme-main/60 transition-all group shadow-sm"
          >
            <div className="w-6 h-6 rounded-lg bg-theme-main/20 border border-theme-main/40 flex items-center justify-center text-theme-main group-hover:scale-105 transition-transform">
              <User size={14} />
            </div>
            <span className="hidden sm:inline font-semibold text-white/90 group-hover:text-white">
              Sign In
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
