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
  elapsedTime?: number;
}

export const LiveStatsBar: React.FC<LiveStatsBarProps> = ({
  metrics,
  mode,
  timeLeft,
  totalDuration,
  currentWordIndex,
  totalWords,
  status,
  elapsedTime = 0,
}) => {
  const isRunning = status === 'running';
  const barRef = React.useRef<HTMLDivElement>(null);

  // Smooth continuous progress bar animation
  React.useEffect(() => {
    if (!barRef.current) return;

    if (mode !== 'time') {
      const wordProgress = Math.min(100, Math.max(0, (currentWordIndex / Math.max(1, totalWords)) * 100));
      barRef.current.style.transition = 'width 200ms ease-out';
      barRef.current.style.width = `${wordProgress}%`;
      return;
    }

    if (status === 'idle') {
      barRef.current.style.transition = 'none';
      barRef.current.style.width = '0%';
      return;
    }

    if (status === 'completed') {
      barRef.current.style.transition = 'width 150ms ease-out';
      barRef.current.style.width = '100%';
      return;
    }

    if (status === 'running') {
      barRef.current.style.transition = 'none';

      let animId: number;
      const startTimestamp = performance.now() - (elapsedTime * 1000);

      const frame = () => {
        const now = performance.now();
        const currentElapsed = (now - startTimestamp) / 1000;
        const pct = Math.min(100, Math.max(0, (currentElapsed / Math.max(1, totalDuration)) * 100));

        if (barRef.current) {
          barRef.current.style.width = `${pct}%`;
        }

        if (pct < 100) {
          animId = requestAnimationFrame(frame);
        }
      };

      animId = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(animId);
    }
  }, [mode, status, totalDuration, currentWordIndex, totalWords]);

  const unitLabel = mode === 'code' ? 'tokens' : 'words';

  return (
    <div className="w-full mx-auto mb-6">
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

      {/* Sleek Continuously Increasing Progress Bar */}
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          ref={barRef}
          className="h-full bg-gradient-to-r from-theme-main/80 to-theme-main shadow-[0_0_12px_var(--color-main)] rounded-full"
          style={{ width: '0%' }}
        />
      </div>
    </div>
  );
};
