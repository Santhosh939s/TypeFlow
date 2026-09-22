import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TestSettings, TestResult, TimelineSample, TestMetrics } from '../types';
import { generateTestText } from '../utils/textGenerator';
import { calculateMetrics, computeDetailedCharacterCounts } from '../utils/metrics';

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
  const [timeline, setTimeline] = useState<TimelineSample[]>([]);

  const startTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Authoritative synchronous refs to eliminate stale closure discrepancies
  const currentInputRef = useRef<string>(currentInput);
  const typedWordsRef = useRef<string[]>(typedWords);
  const currentWordIndexRef = useRef<number>(currentWordIndex);
  const totalKeystrokesRef = useRef<number>(0);
  const timelineRef = useRef<TimelineSample[]>([]);

  // Sync wordsRef when text changes
  useEffect(() => {
    wordsRef.current = text.split(/\s+/).filter(w => w.length > 0);
  }, [text]);

  useEffect(() => {
    currentInputRef.current = currentInput;
  }, [currentInput]);

  useEffect(() => {
    typedWordsRef.current = typedWords;
  }, [typedWords]);

  useEffect(() => {
    currentWordIndexRef.current = currentWordIndex;
  }, [currentWordIndex]);

  useEffect(() => {
    timelineRef.current = timeline;
  }, [timeline]);

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
    setTimeline([]);
    
    currentInputRef.current = '';
    typedWordsRef.current = [];
    currentWordIndexRef.current = 0;
    totalKeystrokesRef.current = 0;
    timelineRef.current = [];
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
      setTimeline([]);

      currentInputRef.current = '';
      typedWordsRef.current = [];
      currentWordIndexRef.current = 0;
      totalKeystrokesRef.current = 0;
      timelineRef.current = [];
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

  // Finish test callback — accepts explicit inputs to eliminate asynchronous state lag
  const finishTest = useCallback((
    finalElapsed: number,
    overrideCurrentInput?: string,
    overrideTypedWords?: string[],
    overrideWordIndex?: number
  ) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setStatus('completed');

    const activeCurrentInput = overrideCurrentInput !== undefined ? overrideCurrentInput : currentInputRef.current;
    const activeTypedWords = overrideTypedWords !== undefined ? overrideTypedWords : typedWordsRef.current;
    const activeWordIndex = overrideWordIndex !== undefined ? overrideWordIndex : currentWordIndexRef.current;

    // Compute standard typing metrics with space accounting
    const charCounts = computeDetailedCharacterCounts(
      wordsRef.current,
      activeTypedWords,
      activeWordIndex,
      activeCurrentInput,
      true // isCompleted
    );

    const activeTimeline = timelineRef.current;
    const metrics = calculateMetrics(
      charCounts.correctChars,
      charCounts.incorrectChars,
      charCounts.extraChars,
      charCounts.missedChars,
      Math.max(1, finalElapsed),
      activeTimeline,
      totalKeystrokesRef.current
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
      timeline: activeTimeline.length > 0 ? activeTimeline : [
        { second: 1, wpm: metrics.wpm, rawWpm: metrics.rawWpm, errors: metrics.incorrectChars }
      ],
      ...metrics,
    };

    onComplete(testResult);
  }, [onComplete, settings.codeLanguage, settings.dsaLanguage, settings.learnCategory, settings.mode, settings.timeDuration, settings.wordCount]);

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

    totalKeystrokesRef.current += 1;
    setTotalKeystrokes(prev => prev + 1);

    const currentTargetWord = wordsRef.current[currentWordIndex] || '';
    const expectedChar = currentTargetWord[currentInput.length];
    const isMatch = char === expectedChar;

    if (isMatch) {
      playSound(false);
    } else {
      playErrorSound();
    }

    const nextInput = currentInput + char;
    setCurrentInput(nextInput);
    currentInputRef.current = nextInput;

    // Check if test completed by finishing the final word in non-time modes
    if (
      settings.mode !== 'time' &&
      currentWordIndex === wordsRef.current.length - 1 &&
      nextInput === currentTargetWord
    ) {
      const elapsed = startTimeRef.current ? (performance.now() - startTimeRef.current) / 1000 : 1;
      finishTest(elapsed, nextInput);
    }
  }, [currentInput, currentWordIndex, ensureTimerStarted, finishTest, playErrorSound, playSound, settings.mode, status]);

  // Low-level space/enter handler
  const processSpace = useCallback(() => {
    if (status === 'completed' || currentInput.length === 0) return;
    ensureTimerStarted();

    totalKeystrokesRef.current += 1;
    setTotalKeystrokes(prev => prev + 1);

    playSound(true);

    const nextTypedWords = [...typedWords, currentInput];
    setTypedWords(nextTypedWords);
    typedWordsRef.current = nextTypedWords;

    // Dynamic word generation in Time mode to prevent running out of words
    if (settings.mode === 'time' && currentWordIndex >= wordsRef.current.length - 15) {
      const extraText = generateTestText({ ...settings, mode: 'words', wordCount: 50 });
      const extraWords = extraText.split(/\s+/).filter(w => w.length > 0);
      setText(prev => prev + ' ' + extraText);
      wordsRef.current = [...wordsRef.current, ...extraWords];
    }

    // Check if test completed in non-time modes
    if (settings.mode !== 'time' && currentWordIndex >= wordsRef.current.length - 1) {
      const elapsed = startTimeRef.current ? (performance.now() - startTimeRef.current) / 1000 : 1;
      finishTest(elapsed, '', nextTypedWords, currentWordIndex + 1);
      return;
    }

    const nextIndex = currentWordIndex + 1;
    setCurrentWordIndex(nextIndex);
    currentWordIndexRef.current = nextIndex;
    setCurrentInput('');
    currentInputRef.current = '';
  }, [currentInput, currentWordIndex, ensureTimerStarted, finishTest, playSound, settings, status, typedWords]);

  // Low-level backspace handler
  const processBackspace = useCallback((isWordDelete: boolean) => {
    if (status === 'completed') return;

    totalKeystrokesRef.current += 1;
    setTotalKeystrokes(prev => prev + 1);

    if (isWordDelete) {
      if (currentInput.length > 0) {
        setCurrentInput('');
        currentInputRef.current = '';
      } else if (currentWordIndex > 0) {
        const prevIndex = currentWordIndex - 1;
        setCurrentWordIndex(prevIndex);
        currentWordIndexRef.current = prevIndex;
        setCurrentInput('');
        currentInputRef.current = '';
        const updatedTyped = typedWords.slice(0, prevIndex);
        setTypedWords(updatedTyped);
        typedWordsRef.current = updatedTyped;
      }
      return;
    }

    if (currentInput.length > 0) {
      const nextInput = currentInput.slice(0, -1);
      setCurrentInput(nextInput);
      currentInputRef.current = nextInput;
    } else if (currentWordIndex > 0) {
      const prevIndex = currentWordIndex - 1;
      const prevTyped = typedWords[prevIndex] || '';
      setCurrentWordIndex(prevIndex);
      currentWordIndexRef.current = prevIndex;
      setCurrentInput(prevTyped);
      currentInputRef.current = prevTyped;
      const updatedTyped = typedWords.slice(0, prevIndex);
      setTypedWords(updatedTyped);
      typedWordsRef.current = updatedTyped;
    }
  }, [currentInput, currentWordIndex, status, typedWords]);

  // Steady timer tick effect — does not get thrashingly re-created on each keystroke
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
      if (currentSec >= 1) {
        setTimeline(prev => {
          if (prev.length === 0 || prev[prev.length - 1].second < currentSec) {
            const counts = computeDetailedCharacterCounts(
              wordsRef.current,
              typedWordsRef.current,
              currentWordIndexRef.current,
              currentInputRef.current,
              false
            );
            const currentWpm = Math.round((counts.correctChars / 5) / (Math.max(0.1, elapsedSec) / 60));
            const currentRawWpm = Math.round((Math.max(counts.totalChars, totalKeystrokesRef.current) / 5) / (Math.max(0.1, elapsedSec) / 60));
            return [...prev, {
              second: currentSec,
              wpm: currentWpm,
              rawWpm: currentRawWpm,
              errors: counts.incorrectChars,
            }];
          }
          return prev;
        });
      }
    }, 200);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status, settings.mode, settings.timeDuration, finishTest]);

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

  // Live real-time metrics calculated with identical formula to finishTest
  const liveCharCounts = useMemo(() => {
    return computeDetailedCharacterCounts(
      wordsRef.current,
      typedWords,
      currentWordIndex,
      currentInput,
      false
    );
  }, [currentInput, currentWordIndex, typedWords, text]);

  const liveMetrics: TestMetrics = useMemo(() => {
    return calculateMetrics(
      liveCharCounts.correctChars,
      liveCharCounts.incorrectChars,
      liveCharCounts.extraChars,
      liveCharCounts.missedChars,
      Math.max(1, elapsedTime),
      timeline,
      totalKeystrokes
    );
  }, [liveCharCounts, elapsedTime, timeline, totalKeystrokes]);

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

