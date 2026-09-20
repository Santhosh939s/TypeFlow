import React, { useRef, useEffect } from 'react';
import { TimelineSample } from '../types';

interface LiveWpmGraphProps {
  timeline: TimelineSample[];
  currentWpm: number;
}

export const LiveWpmGraph: React.FC<LiveWpmGraphProps> = ({ timeline, currentWpm }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dimensions
  const W = 900;
  const H = 90;
  const PAD = { top: 8, right: 16, bottom: 20, left: 36 };

  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);

    if (timeline.length < 2) return;

    const maxSec = Math.max(1, ...timeline.map(d => d.second));
    const maxWpm = Math.max(40, ...timeline.map(d => Math.max(d.wpm, d.rawWpm))) + 15;

    const getX = (sec: number) => PAD.left + (sec / maxSec) * chartW;
    const getY = (wpm: number) => PAD.top + chartH - (Math.max(0, wpm) / maxWpm) * chartH;

    // ── Grid lines ──────────────────────────────────────────────────────────
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);

    const yTicks = [0, Math.round(maxWpm * 0.5), maxWpm];
    yTicks.forEach(v => {
      const y = getY(v);
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(W - PAD.right, y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(148,163,184,0.5)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(String(v), PAD.left - 4, y + 3);
    });

    ctx.setLineDash([]);

    // ── Raw WPM dashed line ───────────────────────────────────────────────
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(148,163,184,0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 4]);
    timeline.forEach((d, i) => {
      const x = getX(d.second);
      const y = getY(d.rawWpm);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // ── WPM gradient fill ─────────────────────────────────────────────────
    const mainColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-main').trim() || '#10b981';

    const gradient = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + chartH);
    gradient.addColorStop(0, `${mainColor}44`);
    gradient.addColorStop(1, `${mainColor}00`);

    ctx.beginPath();
    timeline.forEach((d, i) => {
      const x = getX(d.second);
      const y = getY(d.wpm);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    // Close path down to baseline
    ctx.lineTo(getX(timeline[timeline.length - 1].second), PAD.top + chartH);
    ctx.lineTo(getX(timeline[0].second), PAD.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // ── WPM line ──────────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    timeline.forEach((d, i) => {
      const x = getX(d.second);
      const y = getY(d.wpm);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // ── Live dot at last point ────────────────────────────────────────────
    const last = timeline[timeline.length - 1];
    const lx = getX(last.second);
    const ly = getY(last.wpm);

    // Glow ring
    ctx.beginPath();
    ctx.arc(lx, ly, 6, 0, Math.PI * 2);
    ctx.fillStyle = `${mainColor}33`;
    ctx.fill();

    // Solid dot
    ctx.beginPath();
    ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = mainColor;
    ctx.fill();

    // Live WPM label next to dot
    ctx.fillStyle = mainColor;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    const labelX = Math.min(lx + 8, W - PAD.right - 30);
    ctx.fillText(`${last.wpm}`, labelX, ly + 4);

    // ── X-axis time ticks ─────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(148,163,184,0.4)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    const xStep = Math.max(1, Math.round(maxSec / 5));
    for (let s = xStep; s <= maxSec; s += xStep) {
      ctx.fillText(`${s}s`, getX(s), H - 4);
    }
  }, [timeline, currentWpm]);

  if (timeline.length < 2) return null;

  return (
    <div
      className="w-full max-w-5xl mx-auto mb-4 animate-in fade-in duration-500"
      style={{ opacity: timeline.length < 2 ? 0 : 1 }}
    >
      <div className="flex items-center gap-3 mb-1 px-1">
        <div className="flex items-center gap-1.5 text-[10px] text-theme-sub uppercase tracking-wider">
          <span className="w-3 h-0.5 bg-theme-main rounded inline-block" />
          <span className="text-white font-medium">Live WPM</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-theme-sub">
          <span className="w-3 h-0.5 bg-theme-sub/50 rounded inline-block" style={{ borderTop: '1px dashed' }} />
          <span>Raw</span>
        </div>
      </div>
      <div className="rounded-xl bg-black/20 border border-white/5 overflow-hidden px-1 py-1">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-auto"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
};
