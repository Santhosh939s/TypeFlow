import React from 'react';
import { Clock, AlignLeft, BookOpen, Terminal, Quote as QuoteIcon, Hash, AtSign } from 'lucide-react';
import { TimeDuration, WordCountOption, LearnCategory, DsaLanguage, TestSettings } from '../types';
import { LEARN_CONCEPTS } from '../constants/learnConcepts';
import { DSA_CHALLENGES } from '../constants/dsaChallenges';

interface ModeSelectorProps {
  settings: TestSettings;
  onUpdateSettings: (updates: Partial<TestSettings>) => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  settings,
  onUpdateSettings,
  disabled = false,
}) => {
  const timeDurations: TimeDuration[] = [15, 30, 60, 120];
  const wordCounts: WordCountOption[] = [10, 25, 50, 100];

  const learnCategories: { id: LearnCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'machine_learning', label: 'ML / AI' },
    { id: 'system_design', label: 'System Design' },
    { id: 'cs_core', label: 'CS Core' },
    { id: 'web_dev', label: 'Web' },
  ];

  const dsaLanguages: { id: DsaLanguage; label: string }[] = [
    { id: 'python', label: 'Python' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'cpp', label: 'C++' },
    { id: 'java', label: 'Java' },
  ];

  // Filtered concepts based on category
  const filteredConcepts = settings.learnCategory === 'all'
    ? LEARN_CONCEPTS
    : LEARN_CONCEPTS.filter(c => c.category === settings.learnCategory);

  return (
    <div className={`w-full max-w-4xl mx-auto flex flex-col items-center justify-center gap-2.5 transition-opacity duration-300 ${disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
      {/* Top Primary Modes Bar */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner">
        {/* Time */}
        <button
          onClick={() => onUpdateSettings({ mode: 'time' })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            settings.mode === 'time'
              ? 'bg-theme-main text-black font-semibold shadow-md'
              : 'text-theme-sub hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock size={14} />
          <span>Time</span>
        </button>

        {/* Words */}
        <button
          onClick={() => onUpdateSettings({ mode: 'words' })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            settings.mode === 'words'
              ? 'bg-theme-main text-black font-semibold shadow-md'
              : 'text-theme-sub hover:text-white hover:bg-white/5'
          }`}
        >
          <AlignLeft size={14} />
          <span>Words</span>
        </button>

        {/* Learn Definitions (ML, System Design, CS) */}
        <button
          onClick={() => onUpdateSettings({ mode: 'learn' })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            settings.mode === 'learn'
              ? 'bg-theme-main text-black font-semibold shadow-md'
              : 'text-theme-sub hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen size={14} />
          <span>Learn (ML / CS)</span>
        </button>

        {/* DSA Coding Challenges */}
        <button
          onClick={() => onUpdateSettings({ mode: 'dsa' })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            settings.mode === 'dsa'
              ? 'bg-theme-main text-black font-semibold shadow-md'
              : 'text-theme-sub hover:text-white hover:bg-white/5'
          }`}
        >
          <Terminal size={14} />
          <span>DSA Challenges</span>
        </button>

        {/* Quotes */}
        <button
          onClick={() => onUpdateSettings({ mode: 'quotes' })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            settings.mode === 'quotes'
              ? 'bg-theme-main text-black font-semibold shadow-md'
              : 'text-theme-sub hover:text-white hover:bg-white/5'
          }`}
        >
          <QuoteIcon size={14} />
          <span>Quote</span>
        </button>

        {/* Modifiers for Time & Words */}
        {(settings.mode === 'time' || settings.mode === 'words') && (
          <>
            <div className="w-[1px] h-4 bg-white/10 mx-1 hidden sm:block" />
            <div className="flex items-center gap-1">
              {settings.mode === 'time' && (
                <div className="flex items-center gap-1">
                  {timeDurations.map((duration) => (
                    <button
                      key={duration}
                      onClick={() => onUpdateSettings({ timeDuration: duration })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                        settings.timeDuration === duration
                          ? 'text-theme-main bg-theme-main/10 border border-theme-main/30'
                          : 'text-theme-sub hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {duration}s
                    </button>
                  ))}
                </div>
              )}

              {settings.mode === 'words' && (
                <div className="flex items-center gap-1">
                  {wordCounts.map((count) => (
                    <button
                      key={count}
                      onClick={() => onUpdateSettings({ wordCount: count })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                        settings.wordCount === count
                          ? 'text-theme-main bg-theme-main/10 border border-theme-main/30'
                          : 'text-theme-sub hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              )}

              <div className="w-[1px] h-4 bg-white/10 mx-1 hidden sm:block" />

              <button
                onClick={() => onUpdateSettings({ includePunctuation: !settings.includePunctuation })}
                title="Toggle Punctuation"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  settings.includePunctuation
                    ? 'text-theme-main bg-theme-main/10 border border-theme-main/30'
                    : 'text-theme-sub hover:text-white hover:bg-white/5'
                }`}
              >
                <AtSign size={12} />
                <span>Punctuation</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ includeNumbers: !settings.includeNumbers })}
                title="Toggle Numbers"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  settings.includeNumbers
                    ? 'text-theme-main bg-theme-main/10 border border-theme-main/30'
                    : 'text-theme-sub hover:text-white hover:bg-white/5'
                }`}
              >
                <Hash size={12} />
                <span>Numbers</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Sub-options for Learn Mode */}
      {settings.mode === 'learn' && (
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs animate-in fade-in duration-200">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1">
            {learnCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onUpdateSettings({
                  learnCategory: cat.id,
                  selectedLearnId: cat.id === 'all'
                    ? LEARN_CONCEPTS[0].id
                    : LEARN_CONCEPTS.find(c => c.category === cat.id)?.id || LEARN_CONCEPTS[0].id,
                })}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  settings.learnCategory === cat.id
                    ? 'text-theme-main bg-theme-main/15 border border-theme-main/30 font-semibold'
                    : 'text-theme-sub hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="w-[1px] h-4 bg-white/10 mx-1 hidden sm:block" />

          {/* Direct Concept Selector Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-theme-sub">Concept:</span>
            <select
              value={settings.selectedLearnId || filteredConcepts[0]?.id}
              onChange={(e) => onUpdateSettings({ selectedLearnId: e.target.value })}
              className="bg-[#141822] text-white text-xs border border-white/10 rounded-lg px-2.5 py-1 outline-none focus:border-theme-main/50"
            >
              {filteredConcepts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.term} ({item.categoryLabel})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Sub-options for DSA Challenges Mode */}
      {settings.mode === 'dsa' && (
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs animate-in fade-in duration-200">
          {/* Problem Selector Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-theme-sub">Algorithm:</span>
            <select
              value={settings.selectedDsaId || DSA_CHALLENGES[0].id}
              onChange={(e) => onUpdateSettings({ selectedDsaId: e.target.value })}
              className="bg-[#141822] text-white text-xs border border-white/10 rounded-lg px-2.5 py-1 outline-none focus:border-theme-main/50 font-medium"
            >
              {DSA_CHALLENGES.map((challenge) => (
                <option key={challenge.id} value={challenge.id}>
                  {challenge.title} [{challenge.difficulty}]
                </option>
              ))}
            </select>
          </div>

          <div className="w-[1px] h-4 bg-white/10 mx-1 hidden sm:block" />

          {/* Language Selector Pills */}
          <div className="flex items-center gap-1">
            {dsaLanguages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => onUpdateSettings({ dsaLanguage: lang.id })}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  (settings.dsaLanguage || 'python') === lang.id
                    ? 'text-theme-main bg-theme-main/15 border border-theme-main/30 font-semibold'
                    : 'text-theme-sub hover:text-white hover:bg-white/5'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
