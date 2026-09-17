import React from 'react';
import { X, Trophy, Trash2, Calendar, Award } from 'lucide-react';
import { TestResult } from '../types';

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
  if (!isOpen) return null;

  const pbEntries = Object.entries(personalBests);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl bg-[#11141c] border border-white/10 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-theme-main/10 text-theme-main border border-theme-main/20">
              <Award size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Typing History & Records</h2>
              <p className="text-xs text-theme-sub">Client-side records stored in your browser</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-theme-sub hover:text-white hover:bg-white/5 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Personal Bests Section */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-theme-sub font-semibold mb-3 flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-400" /> Personal Bests
            </h3>

            {pbEntries.length === 0 ? (
              <p className="text-xs text-theme-sub/60 italic py-2">
                No personal bests recorded yet. Complete a test to establish records!
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
                        <span className="text-2xl font-mono font-bold text-amber-400">
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

          {/* Recent Tests Table */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-theme-sub font-semibold mb-3 flex items-center gap-1.5">
              <Calendar size={14} /> Recent Test Sessions ({history.length})
            </h3>

            {history.length === 0 ? (
              <div className="py-12 text-center text-sm text-theme-sub">
                No past tests recorded yet. Start typing to see your history!
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/5">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white/[0.02] text-theme-sub border-b border-white/5">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Mode</th>
                      <th className="py-2.5 px-3 text-right">Net WPM</th>
                      <th className="py-2.5 px-3 text-right">Accuracy</th>
                      <th className="py-2.5 px-3 text-right">Raw</th>
                      <th className="py-2.5 px-3 text-right">Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history.map((test) => (
                      <tr key={test.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-3 text-slate-400">
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
                        <td className="py-2.5 px-3 capitalize text-slate-200">
                          {test.mode} ({test.modeConfig})
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-theme-main">
                          {test.wpm}
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-400">
                          {test.accuracy}%
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">
                          {test.rawWpm}
                        </td>
                        <td className="py-2.5 px-3 text-right text-rose-400">
                          {test.incorrectChars}
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
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
