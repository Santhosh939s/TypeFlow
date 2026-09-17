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
  const words = useRef<string[]>(text.split(' '));

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
  const wordsRef = useRef<string[]>(words.current);

  // Sync wordsRef when text changes
  useEffect(() => {
    wordsRef.current = text.split(' ');
  }, [text]);

  // Generate new text when test settings change
  const initializeNewTest = useCallback((customText?: string) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    const newText = customText ?? generateTestText(settings);
    setText(newText);
    wordsRef.current = newText.split(' ');

    setCurrentWordIndex(0);
    setCurrentInput('');
    setTypedWords([]);
    setStatus('idle');
    setTimeLeft(settings.timeDuration);
    setElapsedTime(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setIncorrectKeystrokes(0);
    setTimeline([]);
    startTimeRef.current = null;
  }, [settings]);

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
  }, [currentInput, currentWordIndex, onComplete, settings.codeLanguage, settings.mode, settings.timeDuration, settings.wordCount, timeline, typedWords]);

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

      // Record second-by-second timeline data for graphs
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

  // Handle keystroke input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>) => {
    // Ignore meta keys (Alt, Ctrl, Cmd, etc. by themselves)
    if (['Control', 'Alt', 'Meta', 'Shift', 'CapsLock', 'Tab'].includes(e.key)) {
      return;
    }

    if (status === 'completed') return;

    // Start test on first keypress
    if (status === 'idle') {
      setStatus('running');
      startTimeRef.current = performance.now();
    }

    const currentTargetWord = wordsRef.current[currentWordIndex] || '';

    // Handle Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();

      if (e.ctrlKey) {
        // Ctrl + Backspace: delete entire current word input
        setCurrentInput('');
        return;
      }

      if (currentInput.length > 0) {
        setCurrentInput(prev => prev.slice(0, -1));
      } else if (currentWordIndex > 0) {
        // Jump back to previous word if allowed
        const prevIndex = currentWordIndex - 1;
        const prevTyped = typedWords[prevIndex] || '';
        setCurrentWordIndex(prevIndex);
        setCurrentInput(prevTyped);
        setTypedWords(prev => prev.slice(0, prevIndex));
      }
      return;
    }

    // Handle Space (Word completion)
    if (e.key === ' ') {
      e.preventDefault();
      if (currentInput.length === 0) return; // Prevent empty spaces

      playSound(true);

      const nextTypedWords = [...typedWords, currentInput];
      setTypedWords(nextTypedWords);
      setTotalKeystrokes(prev => prev + 1);

      // Check if space itself was correct
      if (currentInput === currentTargetWord) {
        setCorrectKeystrokes(prev => prev + 1);
      } else {
        setIncorrectKeystrokes(prev => prev + 1);
      }

      // Check if completed last word
      if (currentWordIndex + 1 >= wordsRef.current.length) {
        const elapsed = startTimeRef.current ? (performance.now() - startTimeRef.current) / 1000 : 1;
        finishTest(elapsed);
        return;
      }

      setCurrentWordIndex(prev => prev + 1);
      setCurrentInput('');
      return;
    }

    // Standard single character key
    if (e.key.length === 1) {
      e.preventDefault();

      const expectedChar = currentTargetWord[currentInput.length];
      const isMatch = e.key === expectedChar;

      if (isMatch) {
        playSound(false);
        setCorrectKeystrokes(prev => prev + 1);
      } else {
        playErrorSound();
        setIncorrectKeystrokes(prev => prev + 1);
      }

      setTotalKeystrokes(prev => prev + 1);
      const nextInput = currentInput + e.key;
      setCurrentInput(nextInput);

      // In quotes or single-word code mode, check if word completed without space
      if (currentWordIndex === wordsRef.current.length - 1 && nextInput === currentTargetWord) {
        const elapsed = startTimeRef.current ? (performance.now() - startTimeRef.current) / 1000 : 1;
        finishTest(elapsed);
      }
    }
  }, [status, currentWordIndex, currentInput, playSound, typedWords, playErrorSound, finishTest]);

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
    handleKeyDown,
    initializeNewTest,
    repeatCurrentTest,
  };
}
