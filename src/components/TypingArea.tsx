import React, { useRef, useEffect, useState, useLayoutEffect, useMemo } from 'react';
import { MousePointerClick, Smartphone } from 'lucide-react';
import { TestMode } from '../types';
import { parseTextStructure } from '../utils/codeParser';

interface TypingAreaProps {
  text: string;
  mode: TestMode;
  words: string[];
  currentWordIndex: number;
  currentInput: string;
  typedWords: string[];
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onMobileInput: (value: string) => void;
  status: 'idle' | 'running' | 'completed';
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  text,
  mode,
  words,
  currentWordIndex,
  currentInput,
  typedWords,
  onKeyDown,
  onMobileInput,
  status,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);

  const [isFocused, setIsFocused] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [caretPos, setCaretPos] = useState<{ left: number; top: number; height: number }>({
    left: 0,
    top: 0,
    height: 28,
  });

  // Parse text into formatted lines and indentation
  const { lines, isCodeMode } = useMemo(() => {
    return parseTextStructure(text, mode === 'code' || mode === 'dsa');
  }, [text, mode]);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

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
        left: charRect.right - containerRect.left,
        top: charRect.top - containerRect.top + (wordsContainerRef.current.scrollTop || 0),
        height: charRect.height || 28,
      });
    } else if (activeWordRef.current) {
      const wordRect = activeWordRef.current.getBoundingClientRect();
      setCaretPos({
        left: wordRect.left - containerRect.left,
        top: wordRect.top - containerRect.top + (wordsContainerRef.current.scrollTop || 0),
        height: wordRect.height || 28,
      });
    }

    // Auto-scroll logic: keep active word in visible area
    if (activeWordRef.current && wordsContainerRef.current) {
      const wordEl = activeWordRef.current;
      const scrollContainer = wordsContainerRef.current;
      const wordTop = wordEl.offsetTop;
      const containerHeight = scrollContainer.clientHeight;

      if (wordTop > containerHeight * 0.5) {
        scrollContainer.scrollTo({
          top: wordTop - 50,
          behavior: 'smooth',
        });
      } else if (wordTop === 0) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentWordIndex, currentInput, words, lines]);

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative w-full max-w-5xl mx-auto min-h-[250px] sm:min-h-[290px] md:min-h-[310px] p-6 sm:p-10 md:p-12 rounded-2xl sm:rounded-3xl bg-[#11141c]/80 border border-white/5 shadow-2xl backdrop-blur-md cursor-text select-none overflow-hidden transition-all duration-300 hover:border-white/10"
    >
      {/* Invisible accessible input supporting physical & virtual touch keyboards */}
      <input
        ref={inputRef}
        type="text"
        value={currentInput}
        onChange={(e) => onMobileInput(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="absolute inset-0 opacity-0 cursor-default z-10 w-full h-full"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Typing input box"
      />

      {/* Focus Lost Overlay */}
      {!isFocused && status !== 'completed' && (
        <div className="absolute inset-0 bg-[#0c0f14]/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-slate-300 animate-in fade-in duration-200 pointer-events-none">
          {isTouchDevice ? (
            <Smartphone size={28} className="text-theme-main animate-bounce mb-2" />
          ) : (
            <MousePointerClick size={28} className="text-theme-main animate-bounce mb-2" />
          )}
          <p className="text-sm sm:text-base font-medium text-white font-sans">
            {isTouchDevice ? 'Tap anywhere to open keyboard' : 'Click or press any key to focus'}
          </p>
          <p className="text-xs text-theme-sub mt-1 font-sans">Keep typing to continue</p>
        </div>
      )}

      {/* Words Stream Container */}
      <div
        ref={wordsContainerRef}
        className={`relative ${
          isCodeMode
            ? 'h-[220px] sm:h-[260px] md:h-[280px] text-lg sm:text-xl md:text-2xl'
            : 'h-[180px] sm:h-[220px] md:h-[240px] text-xl sm:text-2xl md:text-3xl'
        } overflow-y-hidden overflow-x-hidden font-mono leading-[1.8] sm:leading-[1.85] tracking-wide transition-all`}
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

        {/* Lines and Indented Blocks */}
        <div className={isCodeMode ? 'space-y-1 sm:space-y-1.5' : 'flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-2 sm:gap-y-3 items-center'}>
          {lines.map((line, lineIdx) => {
            const isLastLine = lineIdx === lines.length - 1;

            return (
              <div
                key={`line-${lineIdx}`}
                className={isCodeMode ? 'flex flex-wrap gap-x-2 sm:gap-x-2.5 items-center w-full' : 'contents'}
                style={isCodeMode && line.indent > 0 ? { paddingLeft: `${line.indent * 1.5}rem` } : undefined}
              >
                {/* Visual Indentation Guide (Code Mode) */}
                {isCodeMode && line.indent > 0 && (
                  <span
                    className="inline-flex items-center text-theme-sub/20 select-none font-mono text-xs mr-1 tracking-widest"
                    aria-hidden="true"
                  >
                    {'··'.repeat(line.indent)}
                  </span>
                )}

                {/* Render words within this line */}
                {line.wordIndices.map((wordIdx) => {
                  const word = words[wordIdx];
                  if (!word) return null;

                  const isCurrent = wordIdx === currentWordIndex;
                  const isPast = wordIdx < currentWordIndex;
                  const typedWord = isPast ? typedWords[wordIdx] || '' : isCurrent ? currentInput : '';
                  const hasError = isPast && typedWord !== word;
                  const isLastWordInLine = wordIdx === line.wordIndices[line.wordIndices.length - 1];

                  return (
                    <span
                      key={`word-${wordIdx}`}
                      ref={isCurrent ? activeWordRef : null}
                      className={`relative inline-flex items-center transition-opacity duration-150 ${
                        isPast && !hasError ? 'opacity-75' : ''
                      }`}
                    >
                      {/* Render expected characters */}
                      {word.split('').map((char, charIdx) => {
                        let charClass = 'text-theme-sub/40';

                        if (isPast) {
                          if (charIdx < typedWord.length) {
                            charClass = typedWord[charIdx] === char
                              ? 'text-theme-main'
                              : 'text-theme-error underline decoration-2 decoration-theme-error';
                          } else {
                            charClass = 'text-theme-error/70 underline';
                          }
                        } else if (isCurrent) {
                          if (charIdx < currentInput.length) {
                            charClass = currentInput[charIdx] === char
                              ? 'text-theme-main font-semibold drop-shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                              : 'text-theme-error underline decoration-2 decoration-theme-error';
                          }
                        }

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

                      {/* Extra characters */}
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

                      {/* Newline enter symbol at end of code lines */}
                      {isCodeMode && isLastWordInLine && !isLastLine && (
                        <span
                          className={`text-xs ml-1 font-mono transition-opacity select-none ${
                            isCurrent ? 'text-theme-main/70 font-bold animate-pulse' : 'text-theme-sub/20'
                          }`}
                          title="Press Enter or Space for newline"
                        >
                          ↵
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

