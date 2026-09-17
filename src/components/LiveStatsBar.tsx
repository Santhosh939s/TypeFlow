import React from 'react';
import { Zap, Target, Gauge, Timer } from 'lucide-react';
import { TestMetrics, TestMode } from '../types';

interface LiveStatsBarProps {
  metrics: TestMetrics;
  mode: TestMode;
  timeLeft: number;
  totalDuration: number;
  currentWordIndex: number;
  totalWords: number;
  status: 'idle' | 'running' | 'completed';
}

export const LiveStatsBar: React.FC<LiveStatsBarProps> = ({
  metrics,
  mode,
  timeLeft,
  totalDuration,
  currentWordIndex,
  totalWords,
  status,
}) => {
  const isRunning = status === 'running';

  // Calculate progress %
  let progress = 0;
  if (mode === 'time') {
    progress = Math.min(100, Math.max(0, ((totalDuration - timeLeft) / totalDuration) * 100));
  } else {
    progress = Math.min(100, Math.max(0, (currentWordIndex / Math.max(1, totalWords)) * 100));
  }

  const unitLabel = mode === 'code' ? 'tokens' : 'words';

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      {/* Top metrics badges */}
      <div className="flex items-center justify-between px-2 mb-2">
        {/* Left: Primary Live Metric (Time or Word Progress) */}
        <div className="flex items-center gap-2">
          {mode === 'time' ? (
            <div className="flex items-center gap-2 text-2xl font-mono font-bold text-theme-main">
              <Timer size={20} className={isRunning ? 'animate-pulse' : ''} />
              <span>{timeLeft}</span>
              <span className="text-xs font-sans text-theme-sub uppercase tracking-wider font-semibold">
                sec left
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-2xl font-mono font-bold text-theme-main">
              <Timer size={20} />
              <span>{Math.min(currentWordIndex, totalWords)}</span>
              <span className="text-sm font-sans text-theme-sub">/ {totalWords}</span>
              <span className="text-xs font-sans text-theme-sub uppercase tracking-wider font-semibold">
                {unitLabel}
              </span>
            </div>
          )}
        </div>

        {/* Right: Live WPM, Net WPM, Accuracy */}
        <div className="flex items-center gap-5 sm:gap-8 font-mono">
          {/* Live WPM */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider text-theme-sub flex items-center gap-1">
              <Zap size={10} className="text-theme-main" /> WPM
            </span>
            <span className="text-xl font-bold text-white">
              {isRunning ? metrics.wpm : '—'}
            </span>
          </div>

          {/* Live Net WPM */}
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-[10px] uppercase tracking-wider text-theme-sub flex items-center gap-1">
              <Gauge size={10} /> Net WPM
            </span>
            <span className="text-xl font-bold text-slate-300">
              {isRunning ? metrics.netWpm : '—'}
            </span>
          </div>

          {/* Live Accuracy */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider text-theme-sub flex items-center gap-1">
              <Target size={10} className="text-emerald-400" /> ACC
            </span>
            <span className="text-xl font-bold text-white">
              {isRunning ? `${metrics.accuracy}%` : '100%'}
            </span>
          </div>
        </div>
      </div>

      {/* Sleek Progress Bar */}
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-theme-main transition-all duration-300 shadow-[0_0_12px_var(--color-main)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
