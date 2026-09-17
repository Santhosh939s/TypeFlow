import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Cloud, CloudOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UserProfileMenu: React.FC = () => {
  const { user, profile, signOut, isConfigured } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = profile?.display_name || profile?.username || user?.email?.split('@')[0] || 'Typist';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-theme-main/40 hover:bg-white/10 transition-all text-xs text-white"
        title="Account & Profile"
      >
        <div className="w-6 h-6 rounded-lg bg-theme-main/20 text-theme-main flex items-center justify-center font-bold text-xs border border-theme-main/40">
          {initial}
        </div>
        <span className="hidden md:inline font-medium max-w-[100px] truncate">
          {displayName}
        </span>
        {/* Online Cloud Status Dot */}
        <span
          className={`w-2 h-2 rounded-full ${
            isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
          }`}
          title={isConfigured ? 'Connected to Supabase PostgreSQL' : 'Supabase Not Configured'}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#141822] border border-white/10 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl text-white">
          {/* User Info Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-theme-main/20 text-theme-main flex items-center justify-center font-bold text-base border border-theme-main/40 shadow-inner">
              {initial}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm truncate">{displayName}</h4>
              <p className="text-[11px] text-theme-sub truncate">{user?.email}</p>
            </div>
          </div>

          {/* Cloud Database Status */}
          <div className="my-2.5 p-2 rounded-xl bg-white/5 border border-white/5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-theme-sub flex items-center gap-1.5">
                {isConfigured ? (
                  <>
                    <Cloud size={13} className="text-emerald-400" />
                    <span>Cloud Database</span>
                  </>
                ) : (
                  <>
                    <CloudOff size={13} className="text-amber-400" />
                    <span>Disconnected</span>
                  </>
                )}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  isConfigured
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {isConfigured ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Sign Out Action */}
          <button
            onClick={async () => {
              setIsOpen(false);
              await signOut();
            }}
            className="w-full px-2.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-all flex items-center gap-2"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
