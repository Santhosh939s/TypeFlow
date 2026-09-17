import React, { useMemo } from 'react';
import { X, Trophy, Trash2, Calendar, Award, Download, Flame, Clock, BarChart3, Zap } from 'lucide-react';
import { TestResult } from '../types';
import { ActivityHeatmap } from './ActivityHeatmap';
import { exportHistoryToCSV, calculateStreak } from '../utils/metrics';

import { useAuth } from '../context/AuthContext';
import { Cloud } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TestResult[];
  personalBests: Record<string, number>;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  personalBests,
  onClearHistory,
}) => {
  const { user, openAuthModal } = useAuth();

  const pbEntries = Object.entries(personalBests);

  // Aggregate statistics across history
  const stats = useMemo(() => {
    if (!history || history.length === 0) {
      return {
        totalTests: 0,
        totalTimeSec: 0,
        totalWordsTyped: 0,
        avgWpm: 0,
        avgRawWpm: 0,
        highestWpm: 0,
        highestRawWpm: 0,
        avgAcc: 0,
        avgConsistency: 0,
        last10AvgWpm: 0,
      };
    }

    const totalTests = history.length;
    const totalTimeSec = history.reduce((sum, t) => sum + (t.elapsedSeconds || 0), 0);
    const totalWordsTyped = history.reduce((sum, t) => sum + Math.round((t.correctChars || 0) / 5), 0);
    const avgWpm = Math.round(history.reduce((sum, t) => sum + t.wpm, 0) / totalTests);
    const avgRawWpm = Math.round(history.reduce((sum, t) => sum + (t.rawWpm || t.wpm), 0) / totalTests);
    const highestWpm = Math.max(...history.map(t => t.wpm));
    const highestRawWpm = Math.max(...history.map(t => t.rawWpm || t.wpm));
    const avgAcc = parseFloat((history.reduce((sum, t) => sum + t.accuracy, 0) / totalTests).toFixed(1));
    const avgConsistency = Math.round(history.reduce((sum, t) => sum + (t.consistency || 100), 0) / totalTests);

    const last10 = history.slice(0, 10);
    const last10AvgWpm = Math.round(last10.reduce((sum, t) => sum + t.wpm, 0) / last10.length);

    return {
      totalTests,
      totalTimeSec,
      totalWordsTyped,
      avgWpm,
      avgRawWpm,
      highestWpm,
      highestRawWpm,
      avgAcc,
      avgConsistency,
      last10AvgWpm,
    };
  }, [history]);

  const currentStreak = useMemo(() => calculateStreak(history), [history]);

  // Format seconds to HH:MM:SS
  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-[#11141c] border border-white/10 shadow-2xl overflow-hidden font-mono">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-theme-main/10 text-theme-main border border-theme-main/20">
              <Award size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-sans">Practice Dashboard & Analytics</h2>
                {user ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <Cloud size={10} />
                    <span>Cloud Records</span>
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      openAuthModal('signin');
                    }}
                    className="px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-white/5 text-theme-sub hover:text-white border border-white/10 hover:border-white/20 transition-all flex items-center gap-1"
                    title="Sign in to save records to your account"
                  >
                    <Cloud size={10} />
                    <span>Sign In to Save Records</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-theme-sub">Activity Heatmap, speed parameters, and session history</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={() => exportHistoryToCSV(history)}
                title="Export typing tests as CSV spreadsheet"
                className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 bg-white/5 border border-white/10 hover:border-white/20 text-slate-200 transition-all active:scale-95"
              >
                <Download size={13} className="text-theme-main" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-theme-sub hover:text-white hover:bg-white/5 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Aggregate Top Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Tests Completed */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] uppercase text-theme-sub block font-sans mb-1 flex items-center gap-1">
                <BarChart3 size={12} className="text-theme-main" /> Tests Completed
              </span>
              <span className="text-2xl font-bold text-white">{stats.totalTests}</span>
            </div>

            {/* Time Typing */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] uppercase text-theme-sub block font-sans mb-1 flex items-center gap-1">
                <Clock size={12} className="text-theme-main" /> Time Typing
              </span>
              <span className="text-xl font-bold text-slate-200">{formatDuration(stats.totalTimeSec)}</span>
            </div>

            {/* Highest WPM */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] uppercase text-theme-sub block font-sans mb-1 flex items-center gap-1">
                <Zap size={12} className="text-amber-400" /> Peak Speed
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-amber-400">{stats.highestWpm}</span>
                <span className="text-[10px] text-theme-sub">Net / {stats.highestRawWpm} Raw</span>
              </div>
            </div>

            {/* Daily Streak */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] uppercase text-theme-sub block font-sans mb-1 flex items-center gap-1">
                <Flame size={12} className="text-amber-500" /> Current Streak
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{currentStreak}</span>
                <span className="text-[10px] text-amber-400 font-semibold">days active</span>
              </div>
            </div>
          </div>

          {/* Activity Heatmap Calendar */}
          <div>
            <ActivityHeatmap history={history} weeksToShow={20} />
          </div>

          {/* Average Performance Metrics Matrix */}
          {stats.totalTests > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3.5 rounded-2xl bg-white/[0.015] border border-white/5">
              <div>
                <span className="text-theme-sub text-[10px] block">Average Net Speed</span>
                <span className="text-lg font-bold text-theme-main">{stats.avgWpm} WPM</span>
                <span className="text-[10px] text-slate-500 block">Last 10: {stats.last10AvgWpm} WPM</span>
              </div>
              <div>
                <span className="text-theme-sub text-[10px] block">Average Raw Speed</span>
                <span className="text-lg font-bold text-slate-200">{stats.avgRawWpm} WPM</span>
                <span className="text-[10px] text-slate-500 block">Total words: {stats.totalWordsTyped}</span>
              </div>
              <div>
                <span className="text-theme-sub text-[10px] block">Average Accuracy</span>
                <span className="text-lg font-bold text-emerald-400">{stats.avgAcc}%</span>
                <span className="text-[10px] text-slate-500 block">Clean keystrokes</span>
              </div>
              <div>
                <span className="text-theme-sub text-[10px] block">Average Consistency</span>
                <span className="text-lg font-bold text-slate-200">{stats.avgConsistency}%</span>
                <span className="text-[10px] text-slate-500 block">Rhythm variance</span>
              </div>
            </div>
          )}

          {/* Personal Bests Section */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-theme-sub font-semibold mb-3 flex items-center gap-1.5 font-sans">
              <Trophy size={14} className="text-amber-400" /> Category Personal Bests
            </h3>

            {pbEntries.length === 0 ? (
              <p className="text-xs text-theme-sub/60 italic py-2">
                No personal bests recorded yet. Complete a test to establish benchmark records!
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {pbEntries.map(([key, wpm]) => {
                  const [mode, config] = key.split('-');
                  return (
                    <div
                      key={key}
                      className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between"
                    >
                      <span className="text-[11px] uppercase tracking-wider text-theme-sub capitalize font-medium">
                        {mode} {config}
                      </span>
                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-amber-400">
                          {wpm}
                        </span>
                        <span className="text-[10px] text-theme-sub font-mono">WPM</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Tests Table with Advanced Metrics */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-theme-sub font-semibold mb-3 flex items-center gap-1.5 font-sans">
              <Calendar size={14} /> Session History ({history.length})
            </h3>

            {history.length === 0 ? (
              <div className="py-12 text-center text-sm text-theme-sub">
                No past tests recorded yet. Complete your first test to see detailed stats here!
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/5">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white/[0.03] text-theme-sub border-b border-white/5">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Mode</th>
                      <th className="py-2.5 px-3 text-right">Net WPM</th>
                      <th className="py-2.5 px-3 text-right">Raw WPM</th>
                      <th className="py-2.5 px-3 text-right">Accuracy</th>
                      <th className="py-2.5 px-3 text-right">Burst</th>
                      <th className="py-2.5 px-3 text-right">Consistency</th>
                      <th className="py-2.5 px-3 text-right">Chars (C/I/E/M)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history.map((test) => (
                      <tr key={test.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                          {new Date(test.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          <span className="text-[10px] text-slate-500">
                            {new Date(test.timestamp).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 capitalize text-slate-200 whitespace-nowrap">
                          {test.mode} ({test.modeConfig})
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-theme-main">
                          {test.wpm}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300">
                          {test.rawWpm ?? test.wpm}
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-400">
                          {test.accuracy}%
                        </td>
                        <td className="py-2.5 px-3 text-right text-amber-400">
                          {test.burstWpm ?? test.wpm}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300">
                          {test.consistency ?? 100}%
                        </td>
                        <td className="py-2.5 px-3 text-right text-[11px] whitespace-nowrap">
                          <span className="text-emerald-400">{test.correctChars}</span>/
                          <span className="text-rose-400">{test.incorrectChars}</span>/
                          <span className="text-yellow-400">{test.extraChars}</span>/
                          <span className="text-slate-400">{test.missedChars}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-white/5 bg-white/[0.01]">
          {history.length > 0 ? (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all test history and personal bests?')) {
                  onClearHistory();
                }
              }}
              className="text-xs text-rose-400/80 hover:text-rose-400 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={14} />
              <span>Clear All Data</span>
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
