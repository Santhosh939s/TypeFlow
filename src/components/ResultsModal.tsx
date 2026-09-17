import React, { useState } from 'react';
import { RotateCcw, ArrowRight, Trophy, Copy, Check, Gauge, Target, Activity, Clock } from 'lucide-react';
import { TestResult } from '../types';
import { PerformanceChart } from './PerformanceChart';

interface ResultsModalProps {
  result: TestResult;
  onNextTest: () => void;
  onRepeatTest: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  result,
  onNextTest,
  onRepeatTest,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyResult = () => {
    const textToCopy = `⚡ TypeFlow Result: ${result.wpm} WPM | ${result.accuracy}% Acc | Mode: ${result.mode} (${result.modeConfig}) | Consistency: ${result.consistency}%`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#11141c]/95 border border-white/10 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
      {/* Personal Best Celebration Banner */}
      {result.isPersonalBest && (
        <div className="mb-6 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-2.5 text-amber-400 animate-pulse">
          <Trophy size={20} className="text-amber-400" />
          <span className="text-sm font-semibold tracking-wide uppercase">
            New Personal Best Record for {result.mode} ({result.modeConfig})!
          </span>
        </div>
      )}

      {/* Main Hero Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {/* WPM */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col">
          <span className="text-xs uppercase tracking-wider text-theme-sub flex items-center gap-1.5 font-medium mb-1">
            <Gauge size={14} className="text-theme-main" /> Net WPM
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-mono font-extrabold text-theme-main drop-shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              {result.wpm}
            </span>
            <span className="text-xs text-theme-sub font-mono">wpm</span>
          </div>
        </div>

        {/* Accuracy */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col">
          <span className="text-xs uppercase tracking-wider text-theme-sub flex items-center gap-1.5 font-medium mb-1">
            <Target size={14} className="text-emerald-400" /> Accuracy
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-mono font-extrabold text-white">
              {result.accuracy}%
            </span>
          </div>
        </div>

        {/* Raw WPM */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col">
          <span className="text-xs uppercase tracking-wider text-theme-sub flex items-center gap-1.5 font-medium mb-1">
            <Activity size={14} /> Raw WPM
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-slate-300">
              {result.rawWpm}
            </span>
            <span className="text-xs text-theme-sub font-mono">wpm</span>
          </div>
        </div>

        {/* Consistency */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col">
          <span className="text-xs uppercase tracking-wider text-theme-sub flex items-center gap-1.5 font-medium mb-1">
            <Clock size={14} /> Consistency
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-slate-300">
              {result.consistency}%
            </span>
          </div>
        </div>
      </div>

      {/* Speed & Error Progression Chart */}
      <div className="p-4 sm:p-6 rounded-2xl bg-black/30 border border-white/5 mb-6">
        <h3 className="text-xs uppercase tracking-wider text-theme-sub font-semibold mb-4">
          Pace & Accuracy Progression
        </h3>
        <PerformanceChart timeline={result.timeline} avgWpm={result.wpm} />
      </div>

      {/* Detailed Keystroke & Test Meta Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono mb-8 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-theme-sub">
        <div>
          <span className="text-slate-400 block mb-0.5">Test Type:</span>
          <span className="text-white font-medium capitalize">{result.mode} ({result.modeConfig})</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Time Elapsed:</span>
          <span className="text-white font-medium">{result.elapsedSeconds}s</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Characters:</span>
          <span className="text-emerald-400">{result.correctChars}</span> / <span className="text-rose-400">{result.incorrectChars}</span> / <span className="text-yellow-400">{result.extraChars}</span> / <span className="text-slate-400">{result.missedChars}</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Total Keystrokes:</span>
          <span className="text-white font-medium">{result.totalChars}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          {/* Copy Result */}
          <button
            onClick={handleCopyResult}
            className="px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 bg-white/5 border border-white/10 hover:border-white/20 text-slate-200 transition-all active:scale-95"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Share Result'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Repeat Test */}
          <button
            onClick={onRepeatTest}
            title="Repeat the same text passage"
            className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 text-slate-200 transition-all hover:bg-white/10 active:scale-95"
          >
            <RotateCcw size={14} />
            <span>Repeat</span>
          </button>

          {/* Next Test */}
          <button
            onClick={onNextTest}
            className="px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 bg-theme-main text-black shadow-lg shadow-theme-main/20 hover:brightness-110 transition-all active:scale-95"
          >
            <span>Next Test</span>
            <ArrowRight size={14} />
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-black/20 rounded border border-black/30 font-mono">
              Tab
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
