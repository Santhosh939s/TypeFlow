import React, { useState } from 'react';
import {
  Calendar,
  Flame,
  Trophy,
  Share2,
  Check,
  RotateCcw,
  ArrowRight,
  Star,
  Zap,
  Target,
  Activity,
} from 'lucide-react';
import { TestResult } from '../types';
import { getTodayKey } from '../utils/dailyChallenge';
import { PerformanceChart } from './PerformanceChart';

interface DailyChallengeModalProps {
  result: TestResult;
  streak: number;
  alreadyDoneToday: boolean;
  onNextTest: () => void;
  onRepeatTest: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  result,
  streak,
  alreadyDoneToday,
  onNextTest,
  onRepeatTest,
}) => {
  const [copied, setCopied] = useState(false);

  const todayLabel = (() => {
    const key = getTodayKey();
    const [y, m, d] = key.split('-');
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  })();

  const streakEmoji = streak >= 30 ? '🏆' : streak >= 14 ? '🔥' : streak >= 7 ? '⚡' : streak >= 3 ? '✨' : '🎯';

  const streakMessage =
    streak >= 30
      ? 'Legendary! One month strong!'
      : streak >= 14
      ? 'Two weeks! You\'re unstoppable!'
      : streak >= 7
      ? 'One full week! Keep the fire alive!'
      : streak >= 3
      ? 'Three in a row! Building momentum!'
      : streak === 1
      ? 'First challenge completed today!'
      : `${streak} day streak!`;

  const handleShare = () => {
    const text = `🗓️ TypeFlow Daily Challenge — ${todayLabel}\n⚡ ${result.wpm} WPM | 🎯 ${result.accuracy}% accuracy\n🔥 ${streak} day streak\ntypeflow.app`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#11141c]/95 border border-white/10 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">

      {/* ── Daily Challenge Banner ─────────────────────────────────────────── */}
      <div className="mb-6 rounded-2xl overflow-hidden">
        {/* Header strip */}
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/25 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Calendar size={20} />
            </div>
            <div>
              <div className="text-xs text-amber-400/70 uppercase tracking-wider font-semibold">
                Daily Challenge Complete
              </div>
              <div className="text-sm font-bold text-white">{todayLabel}</div>
            </div>
          </div>

          {alreadyDoneToday && (
            <div className="text-xs text-amber-400/60 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg">
              Already recorded for today — practice run
            </div>
          )}
        </div>

        {/* Streak badge */}
        {streak > 0 && (
          <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border-x border-b border-amber-500/20 px-4 py-3 flex items-center justify-center gap-3">
            <Flame size={20} className="text-orange-400 animate-pulse" />
            <div className="text-center">
              <span className="text-2xl font-black text-white">{streakEmoji} {streak}</span>
              <span className="text-sm text-amber-400/80 ml-2 font-medium">
                {streak === 1 ? 'day' : 'day'} streak
              </span>
              <div className="text-xs text-amber-400/60 mt-0.5">{streakMessage}</div>
            </div>
            <Flame size={20} className="text-orange-400 animate-pulse" />
          </div>
        )}
      </div>

      {/* ── Main Metrics ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col">
          <span className="text-xs uppercase tracking-wider text-theme-sub flex items-center gap-1.5 font-medium mb-1">
            <Zap size={14} className="text-theme-main" /> Net WPM
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-mono font-extrabold text-theme-main drop-shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              {result.wpm}
            </span>
            <span className="text-xs text-theme-sub font-mono">wpm</span>
          </div>
        </div>

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

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col">
          <span className="text-xs uppercase tracking-wider text-theme-sub flex items-center gap-1.5 font-medium mb-1">
            <Star size={14} className="text-yellow-400" /> Burst WPM
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-yellow-300">
              {result.burstWpm}
            </span>
            <span className="text-xs text-theme-sub font-mono">wpm</span>
          </div>
        </div>
      </div>

      {/* ── Streak Heatmap Dots (last 7 days) ────────────────────────────── */}
      <StreakDots streak={streak} />

      {/* ── Performance Chart ─────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-black/30 border border-white/5 mb-6">
        <h3 className="text-xs uppercase tracking-wider text-theme-sub font-semibold mb-4">
          Pace &amp; Accuracy Progression
        </h3>
        <PerformanceChart timeline={result.timeline} avgWpm={result.wpm} />
      </div>

      {/* ── Personal Best Banner ─────────────────────────────────────────── */}
      {result.isPersonalBest && (
        <div className="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-2.5 text-amber-400">
          <Trophy size={18} />
          <span className="text-sm font-semibold">New Personal Best! {result.wpm} WPM in Daily mode</span>
        </div>
      )}

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
        <button
          onClick={handleShare}
          className="px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 bg-white/5 border border-white/10 hover:border-white/20 text-slate-200 transition-all active:scale-95"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
          <span>{copied ? 'Copied!' : 'Share Result'}</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRepeatTest}
            className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 text-slate-200 transition-all hover:bg-white/10 active:scale-95"
          >
            <RotateCcw size={14} />
            <span>Retry</span>
          </button>
          <button
            onClick={onNextTest}
            className="px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 bg-theme-main text-black shadow-lg shadow-theme-main/20 hover:brightness-110 transition-all active:scale-95"
          >
            <span>Next Test</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Streak Dot Row (last 7 days) ───────────────────────────────────────────────

import { getAllDailyRecords } from '../utils/dailyChallenge';

const StreakDots: React.FC<{ streak: number }> = ({ streak: _streak }) => {
  const records = getAllDailyRecords();

  // Build last 7 days (today first, oldest last; reverse for display)
  const days: { key: string; label: string; done: boolean; wpm: number | null }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${day}`;
    const shortDay = d.toLocaleDateString('en-US', { weekday: 'short' });
    const rec = records[key];
    days.push({ key, label: shortDay, done: !!rec, wpm: rec?.wpm ?? null });
  }

  return (
    <div className="mb-5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
      <div className="text-[10px] uppercase tracking-wider text-theme-sub mb-2.5 flex items-center gap-1.5">
        <Flame size={11} className="text-orange-400" />
        Last 7 Days
      </div>
      <div className="flex items-end gap-2 justify-between">
        {days.map(day => (
          <div key={day.key} className="flex flex-col items-center gap-1 flex-1">
            <div className="text-[10px] text-theme-sub/60">{day.wpm ? `${day.wpm}` : ''}</div>
            <div
              className={`w-full max-w-[32px] h-7 rounded-lg flex items-center justify-center transition-all ${
                day.done
                  ? 'bg-theme-main/30 border border-theme-main/50'
                  : 'bg-white/5 border border-white/5'
              }`}
            >
              {day.done ? (
                <Check size={12} className="text-theme-main" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
              )}
            </div>
            <div className="text-[10px] text-theme-sub/60">{day.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
