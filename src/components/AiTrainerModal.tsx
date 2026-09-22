import React from 'react';
import { X, Brain, Sparkles } from 'lucide-react';
import { TestResult } from '../types';
import { WeaknessTrainer } from './WeaknessTrainer';

interface AiTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TestResult[];
  onStartDrill: (text: string) => void;
}

export const AiTrainerModal: React.FC<AiTrainerModalProps> = ({
  isOpen,
  onClose,
  history,
  onStartDrill,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#131722] border border-purple-500/20 rounded-2xl shadow-2xl p-5 sm:p-7 text-white animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Brain size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  AI Trainer &amp; Practice Lessons
                </h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Sparkles size={10} /> Non-Repeating Drills
                </span>
              </div>
              <p className="text-xs text-theme-sub mt-0.5">
                Practice 36 non-repeating skill lessons across 6 tracks or generate adaptive drills targeting your personal weak patterns.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-sub hover:text-white hover:bg-white/10 transition-colors"
            title="Close AI Trainer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Core Weakness Trainer Component */}
        <div className="custom-scrollbar">
          <WeaknessTrainer history={history} onStartDrill={onStartDrill} />
        </div>
      </div>
    </div>
  );
};
