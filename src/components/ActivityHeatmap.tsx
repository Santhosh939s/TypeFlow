import React, { useState, useMemo } from 'react';
import { Flame, Calendar, Info } from 'lucide-react';
import { TestResult } from '../types';
import { generateDailyActivityMap, calculateStreak } from '../utils/metrics';

interface ActivityHeatmapProps {
  history: TestResult[];
  weeksToShow?: number;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  history,
  weeksToShow = 20,
}) => {
  const [hoveredDay, setHoveredDay] = useState<{
    dateStr: string;
    formattedDate: string;
    count: number;
    avgWpm: number;
    bestWpm: number;
    timeSeconds: number;
  } | null>(null);

  const activityMap = useMemo(() => generateDailyActivityMap(history), [history]);
  const currentStreak = useMemo(() => calculateStreak(history), [history]);

  // Generate grid cells for weeksToShow ending on the coming Sunday
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    // End date is upcoming Saturday/Sunday to complete the week
    const endDate = new Date(today);
    const dayOfWeek = endDate.getDay(); // 0 is Sun, 1 is Mon...
    // Let week start on Monday (0) to Sunday (6)
    const daysToAddToEnd = (7 - (dayOfWeek === 0 ? 7 : dayOfWeek));
    endDate.setDate(endDate.getDate() + daysToAddToEnd);

    const totalDays = weeksToShow * 7;
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - totalDays + 1);

    const generatedWeeks: Array<Array<{
      date: Date;
      dateKey: string;
      isFuture: boolean;
      count: number;
      avgWpm: number;
      bestWpm: number;
      timeSeconds: number;
    }>> = [];

    const months: Array<{ label: string; weekIndex: number }> = [];
    let lastMonth = -1;

    let currentWeek: Array<any> = [];
    const iterator = new Date(startDate);

    let weekCounter = 0;
    while (iterator <= endDate) {
      const year = iterator.getFullYear();
      const month = String(iterator.getMonth() + 1).padStart(2, '0');
      const day = String(iterator.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      const isFuture = iterator > today;

      const act = activityMap[dateKey] || { count: 0, avgWpm: 0, bestWpm: 0, timeSeconds: 0 };

      // Track month labels
      if (iterator.getMonth() !== lastMonth && currentWeek.length === 0) {
        lastMonth = iterator.getMonth();
        months.push({
          label: iterator.toLocaleDateString(undefined, { month: 'short' }),
          weekIndex: weekCounter,
        });
      }

      currentWeek.push({
        date: new Date(iterator),
        dateKey,
        isFuture,
        count: isFuture ? 0 : act.count,
        avgWpm: isFuture ? 0 : act.avgWpm,
        bestWpm: isFuture ? 0 : act.bestWpm,
        timeSeconds: isFuture ? 0 : act.timeSeconds,
      });

      if (currentWeek.length === 7) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
        weekCounter++;
      }

      iterator.setDate(iterator.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      generatedWeeks.push(currentWeek);
    }

    return { weeks: generatedWeeks, monthLabels: months };
  }, [activityMap, weeksToShow]);

  const totalTestsInPeriod = useMemo(() => {
    return Object.values(activityMap).reduce((sum, d) => sum + d.count, 0);
  }, [activityMap]);

  // Color intensity helper
  const getIntensityClass = (count: number, isFuture: boolean) => {
    if (isFuture) return 'bg-white/[0.02] border-transparent opacity-30 cursor-not-allowed';
    if (count === 0) return 'bg-white/[0.04] border-white/5 hover:border-white/20';
    if (count <= 2) return 'bg-theme-main/30 border-theme-main/40 hover:brightness-125';
    if (count <= 5) return 'bg-theme-main/60 border-theme-main/65 hover:brightness-125';
    if (count <= 9) return 'bg-theme-main/85 border-theme-main/90 hover:brightness-125';
    return 'bg-theme-main border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)] hover:brightness-125';
  };

  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

  return (
    <div className="w-full p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 font-mono">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-theme-sub font-medium">
            <Calendar size={14} className="text-theme-main" />
            <span>Activity Heatmap</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
              {totalTestsInPeriod} tests logged
            </span>
          </div>
        </div>

        {/* Streak & Legend */}
        <div className="flex items-center gap-4 text-xs">
          {/* Active Streak */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 font-semibold text-[11px]">
            <Flame size={13} className={currentStreak > 0 ? 'animate-bounce text-amber-400' : 'text-amber-400/50'} />
            <span>{currentStreak} Day Streak</span>
          </div>

          {/* Color Legend */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-theme-sub">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-white/[0.04] border border-white/5 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-theme-main/30 border border-theme-main/40 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-theme-main/60 border border-theme-main/65 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-theme-main/85 border border-theme-main/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-theme-main border-emerald-300 inline-block" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[500px]">
          {/* Month Labels */}
          <div className="flex text-[10px] text-slate-400 mb-1 ml-7">
            {weeks.map((_, wIdx) => {
              const monthMatch = monthLabels.find((m) => m.weekIndex === wIdx);
              return (
                <div key={`m-${wIdx}`} className="w-3.5 sm:w-4 flex-shrink-0 text-left">
                  {monthMatch ? monthMatch.label : ''}
                </div>
              );
            })}
          </div>

          {/* Grid Rows (7 days per week) */}
          <div className="flex items-start gap-1">
            {/* Day of week labels */}
            <div className="flex flex-col gap-1 text-[9px] text-slate-400 pr-1 select-none">
              {dayLabels.map((lbl, idx) => (
                <span key={`lbl-${idx}`} className="h-3 sm:h-3.5 leading-3 flex items-center">
                  {lbl}
                </span>
              ))}
            </div>

            {/* Weeks columns */}
            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={`week-${wIdx}`} className="flex flex-col gap-1">
                  {week.map((cell, dIdx) => (
                    <button
                      key={`cell-${wIdx}-${dIdx}`}
                      disabled={cell.isFuture}
                      onMouseEnter={() => {
                        if (!cell.isFuture) {
                          setHoveredDay({
                            dateStr: cell.dateKey,
                            formattedDate: cell.date.toLocaleDateString(undefined, {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }),
                            count: cell.count,
                            avgWpm: cell.avgWpm,
                            bestWpm: cell.bestWpm,
                            timeSeconds: cell.timeSeconds,
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-[3px] border transition-all duration-150 ${getIntensityClass(
                        cell.count,
                        cell.isFuture
                      )}`}
                      aria-label={`${cell.dateKey}: ${cell.count} tests`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tooltip / Summary Status bar */}
      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-theme-sub">
        {hoveredDay ? (
          <div className="flex items-center gap-2 text-slate-200">
            <span className="font-semibold text-white">{hoveredDay.formattedDate}:</span>
            {hoveredDay.count > 0 ? (
              <span>
                <strong className="text-theme-main">{hoveredDay.count}</strong> test{hoveredDay.count > 1 ? 's' : ''} completed &middot; Avg:{' '}
                <strong className="text-white">{hoveredDay.avgWpm} WPM</strong> &middot; Peak:{' '}
                <strong className="text-amber-400">{hoveredDay.bestWpm} WPM</strong> &middot; Time:{' '}
                <strong className="text-slate-300">{Math.round(hoveredDay.timeSeconds)}s</strong>
              </span>
            ) : (
              <span className="text-slate-400">No activity recorded</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-400">
            <Info size={12} />
            <span>Hover over any day cell to view test volume, speed, and practice time.</span>
          </div>
        )}
      </div>
    </div>
  );
};
