import React from 'react';
import { Code2, ChevronRight, Zap, Clock, HardDrive } from 'lucide-react';
import { DsaChallenge, DsaLanguage } from '../types';

interface InteractiveDsaCardProps {
  challenge: DsaChallenge;
  currentLanguage: DsaLanguage;
  onNext: () => void;
}

export const InteractiveDsaCard: React.FC<InteractiveDsaCardProps> = ({
  challenge,
  currentLanguage,
  onNext,
}) => {
  const difficultyColor =
    challenge.difficulty === 'Easy'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      : challenge.difficulty === 'Medium'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

  return (
    <div className="w-full mx-auto mb-4 p-4 sm:p-5 rounded-2xl bg-[#131824]/90 border border-theme-main/30 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        {/* Title & Metadata */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-theme-main/15 text-theme-main border border-theme-main/30">
            <Code2 size={18} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {challenge.title}
              </h2>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${difficultyColor}`}>
                {challenge.difficulty}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                {challenge.category}
              </span>
            </div>
            <p className="text-xs text-theme-sub mt-0.5">
              Practice muscle memory for standard technical interview solutions.
            </p>
          </div>
        </div>

        {/* Next Challenge Button */}
        <button
          onClick={onNext}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-white/5 hover:bg-theme-main/15 text-slate-300 hover:text-white border border-white/10 hover:border-theme-main/40 transition-all active:scale-95"
          title="Switch to next algorithm question"
        >
          <span>Next Challenge</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Description & Complexity Badges */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <p className="text-slate-300 flex-1">
          {challenge.description}
        </p>

        <div className="flex items-center gap-2 font-mono shrink-0">
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/30 text-theme-main border border-white/5 text-[11px]">
            <Clock size={12} /> Time: {challenge.timeComplexity}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/30 text-sky-400 border border-white/5 text-[11px]">
            <HardDrive size={12} /> Space: {challenge.spaceComplexity}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-theme-main/10 text-white uppercase text-[10px] font-bold border border-theme-main/30">
            <Zap size={10} className="text-theme-main" /> {currentLanguage}
          </span>
        </div>
      </div>
    </div>
  );
};
