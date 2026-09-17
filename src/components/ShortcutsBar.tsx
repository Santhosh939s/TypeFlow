import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ShortcutsBarProps {
  onRestart: () => void;
}

export const ShortcutsBar: React.FC<ShortcutsBarProps> = ({ onRestart }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-theme-sub">
      {/* Quick restart icon button */}
      <button
        onClick={onRestart}
        title="Restart test (Tab)"
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 hover:text-white hover:bg-white/5 transition-all group active:scale-95"
      >
        <RotateCcw size={14} className="group-hover:rotate-180 transition-transform duration-300 text-theme-main" />
        <span className="font-medium">Restart Test</span>
        <kbd className="px-1.5 py-0.5 text-[10px] bg-white/10 rounded border border-white/10 font-mono text-slate-300">
          Tab
        </kbd>
      </button>

      {/* Keyboard shortcut tips */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 font-mono text-slate-400">
            Tab
          </kbd>
          <span>quick restart</span>
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 font-mono text-slate-400">
            Esc
          </kbd>
          <span>pause / focus</span>
        </div>
        <div className="flex items-center gap-1.5 hidden md:flex">
          <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 font-mono text-slate-400">
            Ctrl + Backspace
          </kbd>
          <span>delete word</span>
        </div>
      </div>
    </div>
  );
};
