import React from 'react';
import { Clock, AlignLeft, Code, Quote as QuoteIcon, BookOpen, Hash, AtSign, Calendar, CheckCircle2 } from 'lucide-react';
import { TimeDuration, WordCountOption, CodeLanguage, LearnCategory, TestSettings } from '../types';
import { hasDoneToday, getTodayKey } from '../utils/dailyChallenge';

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
  const codeLanguages: { id: CodeLanguage; label: string }[] = [
    { id: 'javascript', label: 'JS' },
    { id: 'typescript', label: 'TS' },
    { id: 'python', label: 'Python' },
    { id: 'html_css', label: 'HTML/CSS' },
  ];

  const learnCategories: { id: LearnCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'machine_learning', label: 'ML' },
    { id: 'system_design', label: 'Design' },
    { id: 'cs_core', label: 'CS' },
    { id: 'web_dev', label: 'Web' },
  ];

  const isCodeActive = settings.mode === 'code' || settings.mode === 'dsa';

  // Daily challenge helpers — computed once per render
  const isDoneToday = hasDoneToday();
  const todayShort = (() => {
    const key = getTodayKey();
    const [y, m, d] = key.split('-');
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  })();

  return (
    <div className={`w-full max-w-5xl mx-auto flex items-center justify-center transition-opacity duration-300 ${disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner flex-nowrap overflow-x-auto max-w-full">
        {/* Modes */}
        <div className="flex items-center gap-1 flex-shrink-0">
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

          <button
            onClick={() => onUpdateSettings({ mode: 'code' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isCodeActive
                ? 'bg-theme-main text-black font-semibold shadow-md'
                : 'text-theme-sub hover:text-white hover:bg-white/5'
            }`}
          >
            <Code size={14} />
            <span>Code</span>
          </button>

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

          <button
            onClick={() => onUpdateSettings({ mode: 'learn' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              settings.mode === 'learn'
                ? 'bg-theme-main text-black font-semibold shadow-md'
                : 'text-theme-sub hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen size={14} />
            <span>Learn</span>
          </button>

          {/* Daily Challenge */}
          <button
            onClick={() => onUpdateSettings({ mode: 'daily' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all relative ${
              settings.mode === 'daily'
                ? 'bg-theme-main text-black font-semibold shadow-md'
                : 'text-theme-sub hover:text-white hover:bg-white/5'
            }`}
            title={isDoneToday ? `Daily challenge done! · ${todayShort}` : `Daily challenge · ${todayShort}`}
          >
            {isDoneToday ? (
              <CheckCircle2 size={14} className={settings.mode === 'daily' ? 'text-black' : 'text-emerald-400'} />
            ) : (
              <Calendar size={14} />
            )}
            <span>Daily</span>
            {isDoneToday && settings.mode !== 'daily' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[var(--color-bg)]" />
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="w-[1px] h-4 bg-white/10 mx-1 flex-shrink-0" />

        {/* Sub options based on active mode */}
        <div className="flex items-center gap-1 flex-shrink-0">
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

          {isCodeActive && (
            <div className="flex items-center gap-1">
              {codeLanguages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => onUpdateSettings({ mode: 'code', codeLanguage: lang.id })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    settings.mode === 'code' && settings.codeLanguage === lang.id
                      ? 'text-theme-main bg-theme-main/10 border border-theme-main/30'
                      : 'text-theme-sub hover:text-white hover:bg-white/5'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
              <button
                onClick={() => onUpdateSettings({ mode: 'dsa' })}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  settings.mode === 'dsa'
                    ? 'text-theme-main bg-theme-main/10 border border-theme-main/30'
                    : 'text-theme-sub hover:text-white hover:bg-white/5'
                }`}
              >
                DSA
              </button>
            </div>
          )}

          {settings.mode === 'learn' && (
            <div className="flex items-center gap-1">
              {learnCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onUpdateSettings({ learnCategory: cat.id })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    settings.learnCategory === cat.id
                      ? 'text-theme-main bg-theme-main/10 border border-theme-main/30'
                      : 'text-theme-sub hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modifiers (Punctuation & Numbers) for time/words modes */}
        {(settings.mode === 'time' || settings.mode === 'words') && (
          <>
            <div className="w-[1px] h-4 bg-white/10 mx-1 flex-shrink-0" />
            <div className="flex items-center gap-1 flex-shrink-0">
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
    </div>
  );
};
