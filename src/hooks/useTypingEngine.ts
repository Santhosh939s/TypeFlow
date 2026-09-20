import { useState, useEffect, useRef, useCallback } from 'react';
import { TestSettings, TestResult, TimelineSample, TestMetrics } from '../types';
import { generateTestText } from '../utils/textGenerator';
import { calculateMetrics } from '../utils/metrics';

export function useTypingEngine(
  settings: TestSettings,
  onComplete: (result: TestResult) => void,
  playSound: (isSpace?: boolean) => void,
  playErrorSound: () => void
) {
  const [text, setText] = useState<string>(() => generateTestText(settings));
  const wordsRef = useRef<string[]>(text.split(/\s+/).filter(w => w.length > 0));

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [typedWords, setTypedWords] = useState<string[]>([]);

  // Test state
  const [status, setStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(settings.timeDuration);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Stats tracking
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [incorrectKeystrokes, setIncorrectKeystrokes] = useState(0);
  const [timeline, setTimeline] = useState<TimelineSample[]>([]);

  const startTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync wordsRef when text changes
  useEffect(() => {
    wordsRef.current = text.split(/\s+/).filter(w => w.length > 0);
  }, [text]);

  // Generate new test
  const initializeNewTest = useCallback((customText?: string, customSettings?: TestSettings) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    const activeSettings = customSettings ?? settings;
    const newText = customText ?? generateTestText(activeSettings);
    setText(newText);
    wordsRef.current = newText.split(/\s+/).filter(w => w.length > 0);

    setCurrentWordIndex(0);
    setCurrentInput('');
    setTypedWords([]);
    setStatus('idle');
    setTimeLeft(activeSettings.timeDuration);
    setElapsedTime(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setIncorrectKeystrokes(0);
    setTimeline([]);
    startTimeRef.current = null;
  }, [settings]);

  // Reactive sync when settings change while in idle state
  useEffect(() => {
    if (status === 'idle') {
      const newText = generateTestText(settings);
      setText(newText);
      wordsRef.current = newText.split(/\s+/).filter(w => w.length > 0);
      setTimeLeft(settings.timeDuration);
      setCurrentWordIndex(0);
      setCurrentInput('');
      setTypedWords([]);
      setElapsedTime(0);
      setTotalKeystrokes(0);
      setCorrectKeystrokes(0);
      setIncorrectKeystrokes(0);
      setTimeline([]);
      startTimeRef.current = null;
    }
  }, [
    settings.mode,
    settings.timeDuration,
    settings.wordCount,
    settings.codeLanguage,
    settings.dsaLanguage,
    settings.selectedDsaId,
    settings.selectedLearnId,
    settings.learnCategory,
    settings.includePunctuation,
    settings.includeNumbers,
  ]);

  // Repeat same test
  const repeatCurrentTest = useCallback(() => {
    initializeNewTest(text);
  }, [initializeNewTest, text]);

  // Finish test callback
  const finishTest = useCallback((finalElapsed: number) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setStatus('completed');

    const totalWords = wordsRef.current;
    let finalCorrectChars = 0;
    let finalIncorrectChars = 0;
    let finalExtraChars = 0;
    let finalMissedChars = 0;

    totalWords.forEach((targetWord, wIdx) => {
      const typed = wIdx === currentWordIndex ? currentInput : (typedWords[wIdx] || '');
      if (!typed && wIdx > currentWordIndex) {
        finalMissedChars += targetWord.length;
        return;
      }

      for (let i = 0; i < targetWord.length; i++) {
        if (i < typed.length) {
          if (typed[i] === targetWord[i]) {
            finalCorrectChars++;
          } else {
            finalIncorrectChars++;
          }
        } else {
          finalMissedChars++;
        }
      }

      if (typed.length > targetWord.length) {
        finalExtraChars += (typed.length - targetWord.length);
      }
    });

    const metrics = calculateMetrics(
      finalCorrectChars,
      finalIncorrectChars,
      finalExtraChars,
      finalMissedChars,
      Math.max(1, finalElapsed),
      timeline
    );

    let modeConfig = '';
    if (settings.mode === 'time') modeConfig = `${settings.timeDuration}s`;
    else if (settings.mode === 'words') modeConfig = `${settings.wordCount} words`;
    else if (settings.mode === 'learn') modeConfig = settings.learnCategory;
    else if (settings.mode === 'dsa') modeConfig = settings.dsaLanguage || 'python';
    else if (settings.mode === 'code') modeConfig = settings.codeLanguage;
    else modeConfig = 'quote';

    const testResult: TestResult = {
      id: `test-${Date.now()}`,
      timestamp: Date.now(),
      mode: settings.mode,
      modeConfig,
      timeline: timeline.length > 0 ? timeline : [
        { second: 1, wpm: metrics.wpm, rawWpm: metrics.rawWpm, errors: metrics.incorrectChars }
      ],
      ...metrics,
    };

    onComplete(testResult);
  }, [currentInput, currentWordIndex, onComplete, settings.codeLanguage, settings.dsaLanguage, settings.learnCategory, settings.mode, settings.timeDuration, settings.wordCount, timeline, typedWords]);

  // Start timer if idle
  const ensureTimerStarted = useCallback(() => {
    if (status === 'idle') {
      setStatus('running');
      startTimeRef.current = performance.now();
    }
  }, [status]);

  // Low-level character handler
  const processCharacter = useCallback((char: string) => {
    if (status === 'completed') return;
    ensureTimerStarted();

    const currentTargetWord = wordsRef.current[currentWordIndex] || '';
    const expectedChar = currentTargetWord[currentInput.length];
    const isMatch = char === expectedChar;

    if (isMatch) {
      playSound(false);
      setCorrectKeystrokes(prev => prev + 1);
    } else {
      playErrorSound();
      setIncorrectKeystrokes(prev => prev + 1);
    }

    setTotalKeystrokes(prev => prev + 1);
    const nextInput = currentInput + char;
    setCurrentInput(nextInput);

    if (currentWordIndex === wordsRef.current.length - 1 && nextInput === currentTargetWord) {
      const elapsed = startTimeRef.current ? (performance.now() - startTimeRef.current) / 1000 : 1;
      finishTest(elapsed);
    }
  }, [currentInput, currentWordIndex, ensureTimerStarted, finishTest, playErrorSound, playSound, status]);

  // Low-level space/enter handler
  const processSpace = useCallback(() => {
    if (status === 'completed' || currentInput.length === 0) return;
    ensureTimerStarted();

    playSound(true);

    const currentTargetWord = wordsRef.current[currentWordIndex] || '';
    const nextTypedWords = [...typedWords, currentInput];
    setTypedWords(nextTypedWords);
    setTotalKeystrokes(prev => prev + 1);

    if (currentInput === currentTargetWord) {
      setCorrectKeystrokes(prev => prev + 1);
    } else {
      setIncorrectKeystrokes(prev => prev + 1);
    }

    // Check if test completed
    if (currentWordIndex >= wordsRef.current.length - 1) {
      const elapsed = startTimeRef.current ? (performance.now() - startTimeRef.current) / 1000 : 1;
      finishTest(elapsed);
      return;
    }

    setCurrentWordIndex(prev => prev + 1);
    setCurrentInput('');
  }, [currentInput, currentWordIndex, ensureTimerStarted, finishTest, playSound, status, typedWords]);

  // Low-level backspace handler
  const processBackspace = useCallback((isWordDelete: boolean) => {
    if (status === 'completed') return;

    if (isWordDelete) {
      if (currentInput.length > 0) {
        setCurrentInput('');
      } else if (currentWordIndex > 0) {
        const prevIndex = currentWordIndex - 1;
        setCurrentWordIndex(prevIndex);
        setCurrentInput('');
        setTypedWords(prev => prev.slice(0, prevIndex));
      }
      return;
    }

    if (currentInput.length > 0) {
      setCurrentInput(prev => prev.slice(0, -1));
    } else if (currentWordIndex > 0) {
      const prevIndex = currentWordIndex - 1;
      const prevTyped = typedWords[prevIndex] || '';
      setCurrentWordIndex(prevIndex);
      setCurrentInput(prevTyped);
      setTypedWords(prev => prev.slice(0, prevIndex));
    }
  }, [currentInput, currentWordIndex, status, typedWords]);

  // Timer tick effect
  useEffect(() => {
    if (status !== 'running') return;

    timerIntervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const now = performance.now();
      const elapsedSec = (now - startTimeRef.current) / 1000;
      setElapsedTime(elapsedSec);

      if (settings.mode === 'time') {
        const remaining = Math.max(0, settings.timeDuration - Math.floor(elapsedSec));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          finishTest(settings.timeDuration);
          return;
        }
      }

      const currentSec = Math.floor(elapsedSec);
      setTimeline(prev => {
        if (prev.length === 0 || prev[prev.length - 1].second < currentSec) {
          const currentWpm = Math.round((correctKeystrokes / 5) / (Math.max(0.1, elapsedSec) / 60));
          const currentRawWpm = Math.round((totalKeystrokes / 5) / (Math.max(0.1, elapsedSec) / 60));
          return [...prev, {
            second: currentSec,
            wpm: currentWpm,
            rawWpm: currentRawWpm,
            errors: incorrectKeystrokes,
          }];
        }
        return prev;
      });
    }, 200);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status, settings.mode, settings.timeDuration, correctKeystrokes, totalKeystrokes, incorrectKeystrokes, finishTest]);

  // Physical keyboard key handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>) => {
    if (['Control', 'Alt', 'Meta', 'Shift', 'CapsLock', 'Tab'].includes(e.key)) {
      return;
    }

    if (status === 'completed') return;

    // Handle Backspace (including Ctrl+Backspace for word delete)
    if (e.key === 'Backspace') {
      e.preventDefault();
      const isWordDelete = e.ctrlKey || e.metaKey || e.altKey;
      processBackspace(isWordDelete);
      return;
    }

    // Allow browser native shortcuts (Ctrl++, Ctrl+-, Ctrl+0, Ctrl+R, etc.)
    if ((e.ctrlKey || e.metaKey || e.altKey) && e.key !== 'Backspace') {
      return;
    }

    // Handle Space and Enter
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      processSpace();
      return;
    }

    // Single character
    if (e.key.length === 1) {
      e.preventDefault();
      processCharacter(e.key);
    }
  }, [status, processBackspace, processSpace, processCharacter]);

  // Mobile virtual keyboard input handler
  const handleMobileInput = useCallback((val: string) => {
    if (status === 'completed') return;

    if (val.length < currentInput.length) {
      processBackspace(false);
      return;
    }

    const lastChar = val[val.length - 1];
    if (lastChar === ' ' || lastChar === '\n') {
      processSpace();
    } else {
      processCharacter(lastChar);
    }
  }, [currentInput.length, processBackspace, processCharacter, processSpace, status]);

  // Live real-time metrics
  const liveMetrics: TestMetrics = calculateMetrics(
    correctKeystrokes,
    incorrectKeystrokes,
    0,
    0,
    Math.max(1, elapsedTime),
    timeline
  );

  return {
    text,
    words: wordsRef.current,
    currentWordIndex,
    currentInput,
    typedWords,
    status,
    timeLeft,
    elapsedTime,
    liveMetrics,
    timeline,
    handleKeyDown,
    handleMobileInput,
    initializeNewTest,
    repeatCurrentTest,
  };
}

