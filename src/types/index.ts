export type TestMode = 'time' | 'words' | 'code' | 'quotes';

export type TimeDuration = 15 | 30 | 60 | 120;
export type WordCountOption = 10 | 25 | 50 | 100;
export type CodeLanguage = 'javascript' | 'python' | 'typescript' | 'html_css';

export interface TestSettings {
  mode: TestMode;
  timeDuration: TimeDuration;
  wordCount: WordCountOption;
  codeLanguage: CodeLanguage;
  includePunctuation: boolean;
  includeNumbers: boolean;
  soundEnabled: boolean;
  themeId: string;
}

export type CharStatus = 'idle' | 'correct' | 'incorrect' | 'extra';

export interface CharDetail {
  char: string;
  status: CharStatus;
}

export interface WordDetail {
  original: string;
  typed: string;
  chars: CharDetail[];
  isCompleted: boolean;
  hasError: boolean;
}

export interface TimelineSample {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

export interface TestMetrics {
  wpm: number;
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  totalChars: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  elapsedSeconds: number;
  consistency: number; // percentage (0-100)
}

export interface TestResult extends TestMetrics {
  id: string;
  timestamp: number;
  mode: TestMode;
  modeConfig: string; // e.g. "30s", "25 words", "python"
  timeline: TimelineSample[];
  isPersonalBest?: boolean;
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    bg: string;
    card: string;
    sub: string;
    text: string;
    main: string;
    error: string;
    errorExtra: string;
    caret: string;
  };
}
