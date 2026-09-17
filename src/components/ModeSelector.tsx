import React from 'react';
import { Clock, AlignLeft, Code, Quote as QuoteIcon, Hash, AtSign } from 'lucide-react';
import { TimeDuration, WordCountOption, CodeLanguage, TestSettings } from '../types';

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

  return (
    <div className={`w-full max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-3 transition-opacity duration-300 ${disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner">
        {/* Modes */}
        <div className="flex items-center gap-1">
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
              settings.mode === 'code'
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
        </div>

        {/* Divider */}
        <div className="w-[1px] h-4 bg-white/10 mx-1 hidden sm:block" />

        {/* Sub options based on active mode */}
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

          {settings.mode === 'code' && (
            <div className="flex items-center gap-1">
              {codeLanguages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => onUpdateSettings({ codeLanguage: lang.id })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    settings.codeLanguage === lang.id
                      ? 'text-theme-main bg-theme-main/10 border border-theme-main/30'
                      : 'text-theme-sub hover:text-white hover:bg-white/5'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modifiers (Punctuation & Numbers) for time/words modes */}
        {(settings.mode === 'time' || settings.mode === 'words') && (
          <>
            <div className="w-[1px] h-4 bg-white/10 mx-1 hidden sm:block" />
            <div className="flex items-center gap-1">
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
