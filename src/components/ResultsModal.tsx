import React, { useState } from 'react';
import { RotateCcw, ArrowRight, Trophy, Copy, Check, Gauge, Target, Activity, Clock, Zap, TrendingDown, ShieldAlert, Sparkles } from 'lucide-react';
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
    const textToCopy = `⚡ TypeFlow Result: ${result.wpm} Net WPM | ${result.rawWpm} Raw WPM | ${result.accuracy}% Acc | Burst: ${result.burstWpm} WPM | Consistency: ${result.consistency}% | Mode: ${result.mode} (${result.modeConfig})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compute pacing descriptor
  const getStaminaBadge = (ratio: number) => {
    if (ratio >= 105) return { label: 'Sprint Finish', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    if (ratio >= 92) return { label: 'Even Pace', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    return { label: 'Fatigue Fade', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  };

  const staminaInfo = getStaminaBadge(result.staminaRatio ?? 100);

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {/* Net WPM */}
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
            <span className="text-3xl sm:text-4xl font-mono font-bold text-slate-200">
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
            <span className="text-3xl sm:text-4xl font-mono font-bold text-slate-200">
              {result.consistency}%
            </span>
          </div>
        </div>
      </div>

      {/* Advanced Performance Parameters (User Value Enhancements) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 font-mono">
        {/* Peak Burst Speed */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Zap size={16} />
            </div>
            <div>
              <span className="text-[11px] uppercase text-theme-sub block font-sans">Peak Burst Speed</span>
              <span className="text-xl font-bold text-white">{result.burstWpm} <span className="text-xs font-normal text-theme-sub">WPM</span></span>
            </div>
          </div>
          <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
            Max Velocity
          </span>
        </div>

        {/* Speed Loss / Accuracy Tax */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${result.speedLossWpm === 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              {result.speedLossWpm === 0 ? <Sparkles size={16} /> : <TrendingDown size={16} />}
            </div>
            <div>
              <span className="text-[11px] uppercase text-theme-sub block font-sans">Speed Loss (Tax)</span>
              <span className="text-xl font-bold text-white">
                {result.speedLossWpm === 0 ? '0' : `-${result.speedLossWpm}`} <span className="text-xs font-normal text-theme-sub">WPM</span>
              </span>
            </div>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-lg border ${result.speedLossWpm === 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
            {result.speedLossWpm === 0 ? '100% Clean' : 'Error Penalty'}
          </span>
        </div>

        {/* Stamina / Pacing Balance */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShieldAlert size={16} />
            </div>
            <div>
              <span className="text-[11px] uppercase text-theme-sub block font-sans">Pacing Stamina</span>
              <span className="text-xl font-bold text-white">{result.staminaRatio}%</span>
            </div>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-lg border ${staminaInfo.color}`}>
            {staminaInfo.label}
          </span>
        </div>
      </div>

      {/* Speed & Error Progression Chart */}
      <div className="p-4 sm:p-6 rounded-2xl bg-black/30 border border-white/5 mb-6">
        <h3 className="text-xs uppercase tracking-wider text-theme-sub font-semibold mb-4">
          Pace & Accuracy Progression (Second by Second)
        </h3>
        <PerformanceChart timeline={result.timeline} avgWpm={result.wpm} />
      </div>

      {/* Detailed Keystroke Breakdown */}
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
          <span className="text-slate-400 block mb-0.5">Characters (C/I/E/M):</span>
          <span className="text-emerald-400 font-bold">{result.correctChars}</span> /{' '}
          <span className="text-rose-400 font-bold">{result.incorrectChars}</span> /{' '}
          <span className="text-yellow-400 font-bold">{result.extraChars}</span> /{' '}
          <span className="text-slate-400 font-bold">{result.missedChars}</span>
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
