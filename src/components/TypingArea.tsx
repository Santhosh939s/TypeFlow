import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { MousePointerClick } from 'lucide-react';

interface TypingAreaProps {
  words: string[];
  currentWordIndex: number;
  currentInput: string;
  typedWords: string[];
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  status: 'idle' | 'running' | 'completed';
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  words,
  currentWordIndex,
  currentInput,
  typedWords,
  onKeyDown,
  status,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);

  const [isFocused, setIsFocused] = useState(true);
  const [caretPos, setCaretPos] = useState<{ left: number; top: number; height: number }>({
    left: 0,
    top: 0,
    height: 32,
  });

  // Always keep focus on input unless user intentionally focuses elsewhere
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleContainerClick = () => {
    inputRef.current?.focus();
    setIsFocused(true);
  };

  // Re-focus on any keypress if window receives input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement !== inputRef.current && !['Tab', 'F5', 'F12'].includes(e.key)) {
        inputRef.current?.focus();
        setIsFocused(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Calculate smooth floating caret position
  useLayoutEffect(() => {
    if (!wordsContainerRef.current) return;

    const containerRect = wordsContainerRef.current.getBoundingClientRect();

    if (activeCharRef.current) {
      const charRect = activeCharRef.current.getBoundingClientRect();
      setCaretPos({
        left: charRect.left - containerRect.left,
        top: charRect.top - containerRect.top + (wordsContainerRef.current.scrollTop || 0),
        height: charRect.height || 32,
      });
    } else if (activeWordRef.current) {
      // At the start of the current word
      const wordRect = activeWordRef.current.getBoundingClientRect();
      setCaretPos({
        left: wordRect.left - containerRect.left,
        top: wordRect.top - containerRect.top + (wordsContainerRef.current.scrollTop || 0),
        height: wordRect.height || 32,
      });
    }

    // Auto-scroll logic: keep active word in visible area
    if (activeWordRef.current && wordsContainerRef.current) {
      const wordEl = activeWordRef.current;
      const scrollContainer = wordsContainerRef.current;
      const wordTop = wordEl.offsetTop;
      const containerHeight = scrollContainer.clientHeight;

      // Scroll so active word stays on the 2nd line
      if (wordTop > containerHeight * 0.5) {
        scrollContainer.scrollTo({
          top: wordTop - 48,
          behavior: 'smooth',
        });
      } else if (wordTop === 0) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentWordIndex, currentInput, words]);

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative w-full max-w-4xl mx-auto min-h-[220px] p-6 sm:p-8 rounded-3xl bg-[#11141c]/80 border border-white/5 shadow-2xl backdrop-blur-md cursor-text select-none overflow-hidden transition-all duration-300 hover:border-white/10"
    >
      {/* Hidden input to capture keystrokes reliably */}
      <input
        ref={inputRef}
        type="text"
        value={currentInput}
        onChange={() => {}}
        onKeyDown={onKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="absolute opacity-0 pointer-events-none top-0 left-0 w-0 h-0"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />

      {/* Focus Lost Overlay */}
      {!isFocused && status !== 'completed' && (
        <div className="absolute inset-0 bg-[#0c0f14]/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-slate-300 animate-in fade-in duration-200">
          <MousePointerClick size={28} className="text-theme-main animate-bounce mb-2" />
          <p className="text-base font-medium text-white">Click or press any key to focus</p>
          <p className="text-xs text-theme-sub mt-1">Keep typing to continue</p>
        </div>
      )}

      {/* Words Stream Container */}
      <div
        ref={wordsContainerRef}
        className="relative h-[160px] overflow-y-hidden overflow-x-hidden font-mono text-2xl sm:text-3xl leading-relaxed tracking-wide transition-all"
      >
        {/* Animated Smooth Caret */}
        {isFocused && status !== 'completed' && (
          <div
            className={`typing-caret ${status === 'idle' ? 'blink' : ''}`}
            style={{
              transform: `translate(${caretPos.left}px, ${caretPos.top}px)`,
              height: `${caretPos.height * 0.85}px`,
            }}
          />
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-3 items-center">
          {words.map((word, wordIdx) => {
            const isCurrent = wordIdx === currentWordIndex;
            const isPast = wordIdx < currentWordIndex;
            const typedWord = isPast ? typedWords[wordIdx] || '' : isCurrent ? currentInput : '';
            const hasError = isPast && typedWord !== word;

            return (
              <span
                key={`word-${wordIdx}`}
                ref={isCurrent ? activeWordRef : null}
                className={`relative inline-flex items-center transition-opacity duration-150 ${
                  isPast && !hasError ? 'opacity-80' : ''
                }`}
              >
                {/* Render expected characters */}
                {word.split('').map((char, charIdx) => {
                  let charClass = 'text-theme-sub/40'; // Default upcoming

                  if (isPast) {
                    if (charIdx < typedWord.length) {
                      charClass = typedWord[charIdx] === char
                        ? 'text-theme-main'
                        : 'text-theme-error underline decoration-2 decoration-theme-error';
                    } else {
                      // Character was skipped
                      charClass = 'text-theme-error/70 underline';
                    }
                  } else if (isCurrent) {
                    if (charIdx < currentInput.length) {
                      charClass = currentInput[charIdx] === char
                        ? 'text-theme-main font-semibold drop-shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                        : 'text-theme-error underline decoration-2 decoration-theme-error';
                    }
                  }

                  // Check if this character is where the caret should sit right now
                  const isCaretTarget = isCurrent && charIdx === currentInput.length - 1;

                  return (
                    <span
                      key={`c-${charIdx}`}
                      ref={isCaretTarget ? activeCharRef : null}
                      className={`${charClass} transition-colors duration-75`}
                    >
                      {char}
                    </span>
                  );
                })}

                {/* Extra characters typed past target word length */}
                {typedWord.length > word.length && (
                  <span className="inline-flex">
                    {typedWord.slice(word.length).split('').map((extraChar, extraIdx) => {
                      const isLastExtra = isCurrent && extraIdx === (typedWord.length - word.length - 1);
                      return (
                        <span
                          key={`extra-${extraIdx}`}
                          ref={isLastExtra ? activeCharRef : null}
                          className="text-theme-error bg-theme-error/20 rounded px-[1px] font-bold"
                        >
                          {extraChar}
                        </span>
                      );
                    })}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
