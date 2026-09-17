import React, { useState } from 'react';
import { TimelineSample } from '../types';

interface PerformanceChartProps {
  timeline: TimelineSample[];
  avgWpm: number;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ timeline, avgWpm }) => {
  const [hoveredPoint, setHoveredPoint] = useState<TimelineSample | null>(null);

  if (!timeline || timeline.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-sm text-theme-sub">
        Not enough test data to render graph.
      </div>
    );
  }

  // Dimensions
  const width = 720;
  const height = 220;
  const padding = { top: 25, right: 25, bottom: 35, left: 45 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Compute Scales
  const maxSec = Math.max(1, ...timeline.map((d) => d.second));
  const maxWpm = Math.max(40, ...timeline.map((d) => Math.max(d.wpm, d.rawWpm))) + 10;

  const getX = (second: number) => {
    return padding.left + (second / maxSec) * chartWidth;
  };

  const getY = (wpm: number) => {
    return padding.top + chartHeight - (Math.max(0, wpm) / maxWpm) * chartHeight;
  };

  // Build SVG Path strings
  const wpmPoints = timeline.map((d) => `${getX(d.second)},${getY(d.wpm)}`).join(' ');
  const rawPoints = timeline.map((d) => `${getX(d.second)},${getY(d.rawWpm)}`).join(' ');

  // Gradient area path
  const areaPath = `
    M ${getX(timeline[0].second)},${getY(timeline[0].wpm)}
    ${timeline.map((d) => `L ${getX(d.second)},${getY(d.wpm)}`).join(' ')}
    L ${getX(timeline[timeline.length - 1].second)},${padding.top + chartHeight}
    L ${getX(timeline[0].second)},${padding.top + chartHeight}
    Z
  `;

  // Grid Lines
  const yTicks = [0, Math.round(maxWpm * 0.33), Math.round(maxWpm * 0.66), maxWpm];
  const xTicks = [1, Math.round(maxSec * 0.25), Math.round(maxSec * 0.5), Math.round(maxSec * 0.75), maxSec].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  return (
    <div className="w-full relative select-none">
      {/* Legend & Tooltip Header */}
      <div className="flex items-center justify-between text-xs text-theme-sub mb-2 px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-theme-main rounded" />
            <span className="text-white font-medium">WPM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-theme-sub/60 rounded stroke-dasharray" />
            <span>Raw WPM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-theme-error" />
            <span>Mistakes</span>
          </div>
        </div>

        {hoveredPoint ? (
          <div className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded text-white border border-white/10">
            {hoveredPoint.second}s: <span className="text-theme-main font-bold">{hoveredPoint.wpm} WPM</span> | {hoveredPoint.rawWpm} Raw | {hoveredPoint.errors} Errors
          </div>
        ) : (
          <div className="text-[11px] text-theme-sub">Hover points for detailed breakdown</div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible font-mono"
      >
        <defs>
          <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-main)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-main)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {yTicks.map((val) => (
          <g key={`y-${val}`}>
            <line
              x1={padding.left}
              y1={getY(val)}
              x2={width - padding.right}
              y2={getY(val)}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="3 3"
            />
            <text
              x={padding.left - 8}
              y={getY(val) + 4}
              fill="rgba(148, 163, 184, 0.6)"
              fontSize="10"
              textAnchor="end"
            >
              {val}
            </text>
          </g>
        ))}

        {/* Vertical Grid lines */}
        {xTicks.map((val) => (
          <g key={`x-${val}`}>
            <line
              x1={getX(val)}
              y1={padding.top}
              x2={getX(val)}
              y2={height - padding.bottom}
              stroke="rgba(255, 255, 255, 0.04)"
            />
            <text
              x={getX(val)}
              y={height - padding.bottom + 16}
              fill="rgba(148, 163, 184, 0.6)"
              fontSize="10"
              textAnchor="middle"
            >
              {val}s
            </text>
          </g>
        ))}

        {/* Avg WPM Guide Line */}
        {avgWpm > 0 && (
          <line
            x1={padding.left}
            y1={getY(avgWpm)}
            x2={width - padding.right}
            y2={getY(avgWpm)}
            stroke="var(--color-main)"
            strokeOpacity="0.3"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
        )}

        {/* WPM Area Fill */}
        <path d={areaPath} fill="url(#wpmGradient)" />

        {/* Raw WPM Polyline */}
        <polyline
          fill="none"
          stroke="var(--color-sub)"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          points={rawPoints}
        />

        {/* WPM Line */}
        <polyline
          fill="none"
          stroke="var(--color-main)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={wpmPoints}
        />

        {/* Interactive Data Points and Error Markers */}
        {timeline.map((point, idx) => {
          const cx = getX(point.second);
          const cy = getY(point.wpm);
          const hasError = point.errors > 0;

          return (
            <g
              key={`dot-${idx}`}
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="cursor-pointer"
            >
              {/* Invisible larger hover hit area */}
              <circle cx={cx} cy={cy} r={10} fill="transparent" />

              {/* Data Point */}
              <circle
                cx={cx}
                cy={cy}
                r={hoveredPoint?.second === point.second ? 5 : 2.5}
                fill={hasError ? 'var(--color-error)' : 'var(--color-main)'}
                stroke={hasError ? '#fff' : 'var(--color-card)'}
                strokeWidth={hoveredPoint?.second === point.second ? 2 : 1}
                className="transition-all duration-100"
              />

              {/* Error indicator badge */}
              {hasError && (
                <circle
                  cx={cx}
                  cy={height - padding.bottom - 4}
                  r={3}
                  fill="var(--color-error)"
                  className="animate-pulse"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
