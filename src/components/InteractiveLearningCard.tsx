import React from 'react';
import { BookOpen, Sparkles, ChevronRight, Tag } from 'lucide-react';
import { LearnItem } from '../types';

interface InteractiveLearningCardProps {
  item: LearnItem;
  onNext: () => void;
}

export const InteractiveLearningCard: React.FC<InteractiveLearningCardProps> = ({
  item,
  onNext,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto mb-4 p-4 sm:p-5 rounded-2xl bg-[#131824]/90 border border-theme-main/30 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        {/* Term & Category */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-theme-main/15 text-theme-main border border-theme-main/30">
            <BookOpen size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {item.term}
              </h2>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1">
                <Tag size={10} /> {item.categoryLabel}
              </span>
              {item.difficulty && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {item.difficulty}
                </span>
              )}
            </div>
            <p className="text-xs text-theme-sub mt-0.5">
              Type the definition below to test typing speed and memorize this concept.
            </p>
          </div>
        </div>

        {/* Next Concept Button */}
        <button
          onClick={onNext}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-white/5 hover:bg-theme-main/15 text-slate-300 hover:text-white border border-white/10 hover:border-theme-main/40 transition-all active:scale-95"
          title="Switch to next concept definition"
        >
          <span>Next Concept</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Key Takeaway box */}
      <div className="mt-3 flex items-start gap-2 text-xs bg-black/25 p-2.5 rounded-xl border border-white/5 text-slate-300">
        <Sparkles size={14} className="text-theme-main shrink-0 mt-0.5" />
        <div>
          <strong className="text-white font-medium">Key Takeaway: </strong>
          <span className="text-slate-300">{item.takeaway}</span>
        </div>
      </div>
    </div>
  );
};
