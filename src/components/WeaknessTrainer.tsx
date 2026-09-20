import React, { useMemo } from 'react';
import {
  Brain,
  Zap,
  BarChart2,
  AlertTriangle,
  CheckCircle,
  Play,
  RefreshCw,
  Target,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { TestResult } from '../types';
import { analyzeWeaknesses, generateWeaknessPracticeText } from '../utils/weaknessAnalyzer';

interface WeaknessTrainerProps {
  history: TestResult[];
  onStartDrill: (text: string) => void;
}

export const WeaknessTrainer: React.FC<WeaknessTrainerProps> = ({ history, onStartDrill }) => {
  // Memoize analysis so it only recomputes when history changes
  const report = useMemo(() => analyzeWeaknesses(history), [history]);

  // Regenerate a fresh drill text (re-shuffle same bigrams)
  const handleRegenerateDrill = () => {
    if (!report.hasEnoughData) return;
    const freshText = generateWeaknessPracticeText(report.weakBigrams, report.overallAvgAccuracy);
    // Update the drill text by re-running onStartDrill preview is not needed;
    // just call start directly with fresh text
    onStartDrill(freshText);
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!report.hasEnoughData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-theme-main/10 border border-theme-main/20 flex items-center justify-center text-theme-main">
          <Brain size={32} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">Not Enough Data Yet</h3>
          <p className="text-xs text-theme-sub max-w-xs leading-relaxed">
            {report.improvementTip}
          </p>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`w-2 h-2 rounded-full transition-all ${
                history.length >= n ? 'bg-theme-main' : 'bg-white/10'
              }`}
            />
          ))}
          <span className="text-[11px] text-theme-sub ml-1">
            {history.length}/3 tests completed
          </span>
        </div>
      </div>
    );
  }

  // ── Full analysis UI ───────────────────────────────────────────────────────
  const maxModeWpm = Math.max(...report.weakModes.map((m) => m.avgWpm), 1);

  return (
    <div className="space-y-5">
      {/* ── Header stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
          <div className="text-[10px] text-theme-sub uppercase tracking-wider mb-0.5">Avg WPM</div>
          <div className="text-lg font-black text-theme-main">{report.overallAvgWpm}</div>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
          <div className="text-[10px] text-theme-sub uppercase tracking-wider mb-0.5">Avg Accuracy</div>
          <div
            className={`text-lg font-black ${
              report.overallAvgAccuracy >= 95
                ? 'text-emerald-400'
                : report.overallAvgAccuracy >= 85
                ? 'text-yellow-400'
                : 'text-rose-400'
            }`}
          >
            {report.overallAvgAccuracy}%
          </div>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
          <div className="text-[10px] text-theme-sub uppercase tracking-wider mb-0.5">Error Rate</div>
          <div
            className={`text-lg font-black ${
              report.overallErrorRate <= 3
                ? 'text-emerald-400'
                : report.overallErrorRate <= 8
                ? 'text-yellow-400'
                : 'text-rose-400'
            }`}
          >
            {report.overallErrorRate}%
          </div>
        </div>
      </div>

      {/* ── Weak Bigrams ────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <AlertTriangle size={13} className="text-yellow-400 shrink-0" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-sub">
            Weak Character Patterns
          </h4>
          <span className="text-[10px] text-theme-sub/60 ml-auto">higher % = harder for you</span>
        </div>
        <div className="space-y-2">
          {report.weakBigrams.map((wb, idx) => (
            <div key={wb.bigram} className="flex items-center gap-3">
              {/* Rank */}
              <span className="text-[10px] font-mono text-theme-sub/50 w-4 shrink-0 text-right">
                #{idx + 1}
              </span>

              {/* Bigram badge */}
              <span className="font-mono text-sm font-bold text-white bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1 min-w-[2.5rem] text-center shrink-0">
                {wb.bigram}
              </span>

              {/* Bar */}
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    wb.errorRate >= 75
                      ? 'bg-rose-500'
                      : wb.errorRate >= 55
                      ? 'bg-yellow-400'
                      : 'bg-theme-main'
                  }`}
                  style={{ width: `${wb.errorRate}%` }}
                />
              </div>

              {/* Label & score */}
              <div className="text-right shrink-0">
                <div className="text-[11px] font-bold text-white">{wb.errorRate}%</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-theme-sub/50 mt-2 leading-relaxed">
          {report.weakBigrams[0]?.label} — most error-prone pattern detected in your typing profile
        </p>
      </div>

      {/* ── Mode Performance ────────────────────────────────────────────────── */}
      {report.weakModes.length > 1 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <BarChart2 size={13} className="text-theme-main shrink-0" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-sub">
              Speed by Mode
            </h4>
          </div>
          <div className="space-y-2">
            {report.weakModes.map((mode, idx) => {
              const isWeakest = idx === 0;
              const isStrongest = idx === report.weakModes.length - 1;
              return (
                <div key={mode.mode} className="flex items-center gap-3">
                  <div className="w-20 shrink-0 text-right">
                    <span className="text-[11px] text-theme-sub truncate">{mode.label.replace(' Mode', '')}</span>
                  </div>
                  <div className="flex-1 h-4 bg-white/5 rounded-lg overflow-hidden relative">
                    <div
                      className={`h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2 ${
                        isWeakest
                          ? 'bg-rose-500/30 border border-rose-500/20'
                          : isStrongest
                          ? 'bg-emerald-500/30 border border-emerald-500/20'
                          : 'bg-theme-main/20 border border-theme-main/10'
                      }`}
                      style={{ width: `${Math.max(8, (mode.avgWpm / maxModeWpm) * 100)}%` }}
                    >
                      <span className={`text-[10px] font-bold ${isWeakest ? 'text-rose-400' : isStrongest ? 'text-emerald-400' : 'text-theme-main'}`}>
                        {mode.avgWpm}
                      </span>
                    </div>
                  </div>
                  <div className="w-6 shrink-0">
                    {isWeakest ? (
                      <TrendingDown size={12} className="text-rose-400" />
                    ) : isStrongest ? (
                      <TrendingUp size={12} className="text-emerald-400" />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-theme-sub/50 mt-1.5">
            WPM averages across {history.length} recorded tests
          </p>
        </div>
      )}

      {/* ── AI Coaching Tip ─────────────────────────────────────────────────── */}
      <div className="bg-theme-main/5 border border-theme-main/20 rounded-xl p-3.5 flex gap-3">
        <div className="w-7 h-7 rounded-lg bg-theme-main/15 border border-theme-main/20 flex items-center justify-center text-theme-main shrink-0 mt-0.5">
          <Target size={14} />
        </div>
        <div>
          <div className="text-xs font-semibold text-theme-main mb-0.5 flex items-center gap-1">
            <Zap size={11} />
            AI Coaching Tip
          </div>
          <p className="text-xs text-theme-sub leading-relaxed">{report.improvementTip}</p>
        </div>
      </div>

      {/* ── Practice Text Preview ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle size={13} className="text-theme-main shrink-0" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-sub">
              Generated Drill Text
            </h4>
          </div>
          <button
            onClick={handleRegenerateDrill}
            className="text-[11px] text-theme-sub hover:text-white flex items-center gap-1 transition-colors"
          >
            <RefreshCw size={11} />
            Regenerate
          </button>
        </div>

        {/* Text preview card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5 font-mono text-sm text-theme-sub leading-relaxed tracking-wide break-words">
          {report.practiceText}
        </div>

        <p className="text-[10px] text-theme-sub/50 mt-1.5">
          Targets your top-{report.weakBigrams.length} weak bigrams: {report.weakBigrams.map(b => b.bigram).join(', ')}
        </p>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <button
        onClick={handleRegenerateDrill}
        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-theme-main text-black font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-theme-main/20"
      >
        <Play size={16} fill="currentColor" />
        <span>Start AI Drill Now</span>
      </button>

      <p className="text-[10px] text-center text-theme-sub/40">
        A fresh 40-word drill targeting your weak patterns will load in the typing area
      </p>
    </div>
  );
};
