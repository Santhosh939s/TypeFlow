export type TestMode = 'time' | 'words' | 'learn' | 'dsa' | 'code' | 'quotes';


export type TimeDuration = 15 | 30 | 60 | 120;
export type WordCountOption = 10 | 25 | 50 | 100;
export type CodeLanguage = 'javascript' | 'python' | 'typescript' | 'html_css';

export type LearnCategory = 'all' | 'machine_learning' | 'system_design' | 'cs_core' | 'web_dev';

export type DsaLanguage = 'python' | 'javascript' | 'typescript' | 'cpp' | 'java';

export interface LearnItem {
  id: string;
  term: string;
  category: LearnCategory;
  categoryLabel: string;
  definition: string;
  takeaway: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface DsaChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  solutions: Record<DsaLanguage, string>;
}

export interface TestSettings {
  mode: TestMode;
  timeDuration: TimeDuration;
  wordCount: WordCountOption;
  codeLanguage: CodeLanguage;
  learnCategory: LearnCategory;
  selectedLearnId: string;
  selectedDsaId: string;
  dsaLanguage: DsaLanguage;
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
  burstWpm: number; // Peak rolling interval speed
  speedLossWpm: number; // Raw WPM - Net WPM (accuracy tax)
  accuracy: number;
  totalChars: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  elapsedSeconds: number;
  consistency: number; // percentage (0-100)
  staminaRatio: number; // 2nd half speed / 1st half speed * 100
}

export interface TestResult extends TestMetrics {
  id: string;
  timestamp: number;
  mode: TestMode;
  modeConfig: string; // e.g. "30s", "25 words", "python"
  timeline: TimelineSample[];
  isPersonalBest?: boolean;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  count: number;
  avgWpm: number;
  bestWpm: number;
  timeSeconds: number;
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

export interface UserProfile {
  id?: string;
  email?: string;
  username: string;
  display_name?: string;
  title?: string;
  bio?: string;
  customAvatar?: string | null; // Base64 image data URL or URL
  avatar_url?: string;
  avatarSeed?: string; // Deterministic seed for GitHub-style identicon
  joinedDate?: string;
  theme_id?: string;
  sound_enabled?: boolean;
  created_at?: string;
}

export type AuthMode = 'signin' | 'signup';
export type AuthModalMode = 'signin' | 'signup' | 'reset';

export interface LeaderboardEntry {
  test_id: string;
  user_id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  mode: TestMode;
  mode_config: string;
  wpm: number;
  raw_wpm: number;
  accuracy: number;
  consistency: number;
  elapsed_seconds: number;
  created_at: string;
}


