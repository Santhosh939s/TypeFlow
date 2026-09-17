import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface ShortcutsBarProps {
  onRestart: () => void;
}

export const ShortcutsBar: React.FC<ShortcutsBarProps> = ({ onRestart }) => {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-theme-sub px-1">
      {/* Quick restart icon button */}
      <button
        onClick={onRestart}
        title="Restart test (Tab)"
        className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-theme-main/40 hover:text-white hover:bg-white/10 transition-all group active:scale-95 shadow-sm"
      >
        <RotateCcw size={14} className="group-hover:rotate-180 transition-transform duration-300 text-theme-main" />
        <span className="font-semibold text-slate-200">Restart Test</span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white/10 rounded border border-white/10 font-mono text-slate-300">
          Tab
        </kbd>
      </button>

      {/* Cross-system keyboard shortcut tips */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 font-mono text-slate-400">
            Tab
          </kbd>
          <span>restart</span>
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 font-mono text-slate-400">
            Esc
          </kbd>
          <span>focus</span>
        </div>
        <div className="flex items-center gap-1.5 hidden md:flex">
          <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 font-mono text-slate-400">
            {isMac ? 'Cmd / ⌥ + Backspace' : 'Ctrl + Backspace'}
          </kbd>
          <span>delete word</span>
        </div>
      </div>
    </div>
  );
};
