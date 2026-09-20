import React, { useState, useEffect } from 'react';
import { X, Trophy, Award, RefreshCw } from 'lucide-react';
import { dbService } from '../services/dbService';
import { LeaderboardEntry, TestMode } from '../types';
import { useAuth } from '../context/AuthContext';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const { user, isConfigured } = useAuth();
  const [mode, setMode] = useState<TestMode>('time');
  const [modeConfig, setModeConfig] = useState<string>('30s');
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => {
    return dbService.getCachedLeaderboard('time', '30s');
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadLeaderboard = async (force: boolean = false) => {
    if (force) setIsRefreshing(true);
    else if (entries.length === 0) setIsLoading(true);

    try {
      const data = await dbService.fetchLeaderboard(mode, modeConfig, 25, force);
      setEntries(data);
    } catch (err) {
      console.warn('[LeaderboardModal] Error fetching leaderboard:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    // Instantly set cached or baseline records for the selected mode
    const cached = dbService.getCachedLeaderboard(mode, modeConfig);
    if (cached.length > 0) {
      setEntries(cached);
    }
    // Background revalidate
    loadLeaderboard(false);
  }, [isOpen, mode, modeConfig]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[#141822] border border-white/10 shadow-2xl p-6 sm:p-7 text-white animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Trophy size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Community Leaderboard</h2>
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ⚡ Fast Cache
                </span>
              </div>
              <p className="text-xs text-theme-sub">Global rankings for precision speed typing</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => loadLeaderboard(true)}
              disabled={isRefreshing}
              title="Force refresh from Cloud"
              className="p-2 rounded-lg text-theme-sub hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-theme-main' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-theme-sub hover:text-white hover:bg-white/5 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => {
                setMode('time');
                setModeConfig('30s');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                mode === 'time'
                  ? 'bg-theme-main text-black font-semibold'
                  : 'text-theme-sub hover:text-white'
              }`}
            >
              Time
            </button>
            <button
              onClick={() => {
                setMode('words');
                setModeConfig('25 words');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                mode === 'words'
                  ? 'bg-theme-main text-black font-semibold'
                  : 'text-theme-sub hover:text-white'
              }`}
            >
              Words
            </button>
            <button
              onClick={() => {
                setMode('daily');
                setModeConfig('quote');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                mode === 'daily'
                  ? 'bg-theme-main text-black font-semibold'
                  : 'text-theme-sub hover:text-white'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => {
                setMode('quotes');
                setModeConfig('quote');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                mode === 'quotes'
                  ? 'bg-theme-main text-black font-semibold'
                  : 'text-theme-sub hover:text-white'
              }`}
            >
              Quotes
            </button>
          </div>

          {/* Config options */}
          <div className="flex items-center gap-1.5">
            {mode === 'time' ? (
              ['15s', '30s', '60s', '120s'].map((cfg) => (
                <button
                  key={cfg}
                  onClick={() => setModeConfig(cfg)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                    modeConfig === cfg
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-theme-sub hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cfg}
                </button>
              ))
            ) : mode === 'words' ? (
              ['10 words', '25 words', '50 words', '100 words'].map((cfg) => (
                <button
                  key={cfg}
                  onClick={() => setModeConfig(cfg)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                    modeConfig === cfg
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-theme-sub hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cfg}
                </button>
              ))
            ) : (
              <span className="px-2.5 py-1 rounded-lg text-xs bg-white/10 text-theme-sub font-mono">
                Standard
              </span>
            )}
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-1.5 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-theme-sub">
              <RefreshCw size={24} className="animate-spin text-theme-main mb-2" />
              <p className="text-xs">Loading leaderboard...</p>
            </div>
          ) : !isConfigured ? (
            <div className="text-center py-12 px-4">
              <Trophy size={32} className="mx-auto text-theme-sub mb-3 opacity-40" />
              <p className="text-sm font-medium text-white mb-1">Leaderboards require Supabase</p>
              <p className="text-xs text-theme-sub max-w-sm mx-auto">
                Configure your Supabase database in <code className="text-theme-main">.env</code> to enable global community rankings.
              </p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Award size={32} className="mx-auto text-theme-sub mb-3 opacity-40" />
              <p className="text-sm font-medium text-white mb-1">No scores recorded yet</p>
              <p className="text-xs text-theme-sub">
                Be the first typist to set a high score in this category!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {entries.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = user && entry.user_id === user.id;

                return (
                  <div
                    key={entry.test_id || index}
                    className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors ${
                      isCurrentUser
                        ? 'bg-theme-main/10 border border-theme-main/30'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Icon */}
                      <span className="w-7 text-center font-bold text-sm">
                        {rank === 1 ? (
                          <span className="text-amber-400 font-mono text-base">🥇</span>
                        ) : rank === 2 ? (
                          <span className="text-slate-300 font-mono text-base">🥈</span>
                        ) : rank === 3 ? (
                          <span className="text-amber-600 font-mono text-base">🥉</span>
                        ) : (
                          <span className="text-theme-sub text-xs">#{rank}</span>
                        )}
                      </span>

                      {/* Typist Name */}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-white truncate max-w-[140px] sm:max-w-[180px]">
                            {entry.display_name || entry.username}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[10px] px-1 py-0.2 rounded bg-theme-main text-black font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-theme-sub">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs">
                      <div className="text-right">
                        <span className="text-theme-sub text-[10px] uppercase block">WPM</span>
                        <span className="text-theme-main font-bold text-sm">{entry.wpm}</span>
                      </div>
                      <div className="text-right hidden sm:block">
                        <span className="text-theme-sub text-[10px] uppercase block">ACC</span>
                        <span className="text-white font-medium">{entry.accuracy}%</span>
                      </div>
                      <div className="text-right hidden sm:block">
                        <span className="text-theme-sub text-[10px] uppercase block">RAW</span>
                        <span className="text-theme-sub">{entry.raw_wpm}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
