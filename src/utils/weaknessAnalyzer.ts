import { TestResult, TestMode } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BigramWeakness {
  bigram: string;
  errorRate: number;   // 0–100 (higher = worse)
  label: string;       // human-readable description
}

export interface ModeWeakness {
  mode: TestMode;
  label: string;
  avgWpm: number;
  avgAccuracy: number;
  testCount: number;
  relativeScore: number; // 0–100, lower = weaker compared to user's best mode
}

export interface WeaknessReport {
  hasEnoughData: boolean;         // requires ≥ 3 tests
  overallAvgWpm: number;
  overallAvgAccuracy: number;
  overallErrorRate: number;       // 0–100
  weakBigrams: BigramWeakness[];  // top-5 problem bigrams
  weakModes: ModeWeakness[];      // all modes with data, sorted slowest first
  improvementTip: string;         // personalised coaching tip
  practiceText: string;           // AI-generated drill text targeting weaknesses
}

// ─── Research-backed bigram difficulty tiers ─────────────────────────────────
// Sourced from typing difficulty research: these are the statistically hardest
// English bigrams for touch-typists, organised by difficulty tier.

const BIGRAM_DIFFICULTY: Record<string, { label: string; baseDifficulty: number }> = {
  // Tier 1 – same-hand stretches (hardest)
  qu: { label: 'qu  (left stretch)', baseDifficulty: 90 },
  wh: { label: 'wh  (left top row)', baseDifficulty: 85 },
  ph: { label: 'ph  (cross-hand)', baseDifficulty: 82 },
  ck: { label: 'ck  (right reach)', baseDifficulty: 80 },
  // Tier 2 – common but awkward rolls
  th: { label: 'th  (top→bottom roll)', baseDifficulty: 72 },
  ch: { label: 'ch  (left hand roll)', baseDifficulty: 70 },
  gh: { label: 'gh  (G→H cross)', baseDifficulty: 68 },
  br: { label: 'br  (bottom reach)', baseDifficulty: 65 },
  tr: { label: 'tr  (top→bottom)', baseDifficulty: 63 },
  // Tier 3 – frequent trigrams as bigrams
  ng: { label: 'ng  (right-hand roll)', baseDifficulty: 58 },
  nd: { label: 'nd  (right-hand)', baseDifficulty: 55 },
  nt: { label: 'nt  (right hand)', baseDifficulty: 53 },
  st: { label: 'st  (middle row)', baseDifficulty: 50 },
  pr: { label: 'pr  (left reach)', baseDifficulty: 50 },
  // Tier 4 – common but error-prone
  ly: { label: 'ly  (right hand)', baseDifficulty: 45 },
  ry: { label: 'ry  (right reach)', baseDifficulty: 43 },
  pl: { label: 'pl  (left pinky)', baseDifficulty: 42 },
  ve: { label: 've  (V key reach)', baseDifficulty: 40 },
  wr: { label: 'wr  (W→R jump)', baseDifficulty: 40 },
  // Tier 5 – moderate difficulty
  sh: { label: 'sh  (left+right)', baseDifficulty: 35 },
  ed: { label: 'ed  (right hand)', baseDifficulty: 30 },
  er: { label: 'er  (right-home roll)', baseDifficulty: 28 },
  in: { label: 'in  (right hand)', baseDifficulty: 25 },
  on: { label: 'on  (right hand)', baseDifficulty: 22 },
};

// ─── Words keyed by which weak bigrams they practice ─────────────────────────
// Every word contains at least one of the bigrams from BIGRAM_DIFFICULTY.

const BIGRAM_DRILL_WORDS: Record<string, string[]> = {
  qu: ['quick', 'quiet', 'queen', 'quite', 'query', 'quote', 'quest', 'quill', 'quake', 'quorum'],
  wh: ['when', 'where', 'while', 'which', 'white', 'wheat', 'wheel', 'whole', 'whom', 'whisper'],
  ph: ['phone', 'photo', 'phrase', 'phase', 'physics', 'graph', 'alpha', 'orphan', 'trophy', 'phobia'],
  ck: ['clock', 'black', 'track', 'quick', 'stack', 'block', 'crack', 'knock', 'thick', 'check'],
  th: ['that', 'then', 'them', 'this', 'think', 'there', 'three', 'throw', 'truth', 'thread'],
  ch: ['each', 'much', 'such', 'rich', 'reach', 'teach', 'chair', 'chain', 'chance', 'chunk'],
  gh: ['night', 'light', 'right', 'might', 'fight', 'sight', 'tight', 'eight', 'ought', 'ghost'],
  br: ['bring', 'break', 'broad', 'brave', 'brain', 'brief', 'brush', 'brown', 'brand', 'breach'],
  tr: ['track', 'train', 'trail', 'trust', 'trade', 'trend', 'tribe', 'trick', 'truth', 'tree'],
  ng: ['long', 'ring', 'sing', 'bring', 'thing', 'strong', 'swing', 'along', 'among', 'spring'],
  nd: ['find', 'kind', 'send', 'bond', 'fund', 'hand', 'land', 'mind', 'wind', 'stand'],
  nt: ['print', 'front', 'paint', 'count', 'giant', 'plant', 'point', 'grant', 'event', 'spent'],
  st: ['start', 'state', 'still', 'store', 'stand', 'step', 'storm', 'stone', 'stack', 'steam'],
  pr: ['print', 'prove', 'prime', 'press', 'price', 'prior', 'prose', 'proud', 'probe', 'pride'],
  ly: ['only', 'early', 'apply', 'daily', 'reply', 'truly', 'fully', 'slowly', 'clearly', 'gently'],
  ry: ['story', 'every', 'carry', 'sorry', 'worry', 'hurry', 'query', 'berry', 'ferry', 'entry'],
  pl: ['place', 'plan', 'plant', 'play', 'plea', 'plus', 'plane', 'plume', 'plate', 'plain'],
  ve: ['have', 'give', 'live', 'love', 'move', 'save', 'serve', 'solve', 'drive', 'prove'],
  wr: ['write', 'wrong', 'wrote', 'wrap', 'wrist', 'wren', 'wreck', 'wraith', 'writhe', 'wrung'],
  sh: ['show', 'share', 'shelf', 'shift', 'shoot', 'short', 'shout', 'sheer', 'sharp', 'shine'],
  ed: ['need', 'used', 'said', 'made', 'helped', 'moved', 'asked', 'noted', 'tried', 'saved'],
  er: ['other', 'over', 'under', 'after', 'never', 'ever', 'power', 'cover', 'river', 'order'],
  in: ['into', 'thin', 'main', 'mind', 'fine', 'link', 'line', 'mine', 'pine', 'wine'],
  on: ['on', 'one', 'only', 'front', 'phone', 'stone', 'prone', 'clone', 'alone', 'blown'],
};

// ─── Filler connective words to pad drill sentences naturally ────────────────

const FILLERS = [
  'the', 'and', 'a', 'to', 'of', 'in', 'is', 'it', 'was', 'are',
  'for', 'as', 'at', 'by', 'but', 'not', 'all', 'can', 'her', 'him',
  'his', 'how', 'its', 'may', 'our', 'out', 'two', 'use', 'way', 'we',
];

// ─── Mode display labels ───────────────────────────────────────────────────────

const MODE_LABELS: Record<TestMode, string> = {
  time: 'Time Mode',
  words: 'Words Mode',
  code: 'Code Mode',
  quotes: 'Quotes Mode',
  learn: 'Learn Mode',
  dsa: 'DSA Mode',
  daily: 'Daily Challenge',
};

// ─── Coaching tips keyed by dominant weakness ─────────────────────────────────

function buildImprovementTip(
  weakBigrams: BigramWeakness[],
  weakModes: ModeWeakness[],
  overallAccuracy: number,
  overallWpm: number,
): string {
  if (overallAccuracy < 85) {
    return `Your accuracy (${overallAccuracy}%) is below target. Slow down by 20% and focus on hitting every key cleanly before building speed again.`;
  }
  if (weakBigrams.length > 0) {
    const top = weakBigrams[0].bigram.toUpperCase();
    return `Your biggest bottleneck is the "${top}" bigram. The drill below targets it heavily — type slowly at first, then increase speed once your muscle memory locks in.`;
  }
  if (weakModes.length > 0 && weakModes[0].avgWpm < overallWpm * 0.8) {
    return `You're noticeably slower in ${weakModes[0].label}. Practice it daily with short focused sessions to build familiarity.`;
  }
  if (overallWpm < 40) {
    return `Focus on accuracy first — aim for 95%+ before chasing speed. Once your fingers know the correct motions, speed follows naturally.`;
  }
  return `You\'re performing well overall! Keep practicing consistently and push your burst WPM higher by doing short 15-second sprints.`;
}

// ─── Core Analysis ────────────────────────────────────────────────────────────

export function analyzeWeaknesses(history: TestResult[]): WeaknessReport {
  const MIN_TESTS = 3;

  if (!history || history.length < MIN_TESTS) {
    return {
      hasEnoughData: false,
      overallAvgWpm: 0,
      overallAvgAccuracy: 0,
      overallErrorRate: 0,
      weakBigrams: [],
      weakModes: [],
      improvementTip: `Complete at least ${MIN_TESTS} typing tests to unlock your personalised AI Weakness Analysis.`,
      practiceText: '',
    };
  }

  // ── Overall stats ──────────────────────────────────────────────────────────
  const overallAvgWpm = Math.round(
    history.reduce((s, r) => s + r.wpm, 0) / history.length
  );
  const overallAvgAccuracy = Math.round(
    history.reduce((s, r) => s + r.accuracy, 0) / history.length
  );
  const totalCharsTyped = history.reduce((s, r) => s + (r.totalChars || 0), 0);
  const totalIncorrect = history.reduce((s, r) => s + (r.incorrectChars || 0), 0);
  const overallErrorRate = totalCharsTyped > 0
    ? Math.round((totalIncorrect / totalCharsTyped) * 100)
    : 0;

  // ── Per-mode breakdown ─────────────────────────────────────────────────────
  const modeMap: Record<string, { wpmSum: number; accSum: number; count: number }> = {};
  history.forEach(r => {
    const key = r.mode;
    if (!modeMap[key]) modeMap[key] = { wpmSum: 0, accSum: 0, count: 0 };
    modeMap[key].wpmSum += r.wpm;
    modeMap[key].accSum += r.accuracy;
    modeMap[key].count += 1;
  });

  const modeEntries = Object.entries(modeMap).map(([mode, data]) => ({
    mode: mode as TestMode,
    label: MODE_LABELS[mode as TestMode] ?? mode,
    avgWpm: Math.round(data.wpmSum / data.count),
    avgAccuracy: Math.round(data.accSum / data.count),
    testCount: data.count,
    relativeScore: 0, // filled below
  }));

  // Normalise relative score (0–100), 100 = best mode, 0 = worst
  const maxModeWpm = Math.max(...modeEntries.map(m => m.avgWpm), 1);
  modeEntries.forEach(m => {
    m.relativeScore = Math.round((m.avgWpm / maxModeWpm) * 100);
  });

  // Sort: slowest first (worst relative score first)
  const weakModes = modeEntries.sort((a, b) => a.relativeScore - b.relativeScore);

  // ── Bigram weakness scoring ────────────────────────────────────────────────
  // Strategy: combine base bigram difficulty with the user's personal error rate
  // and weight more heavily if the user is in the bottom quartile for accuracy.

  const accuracyPenalty = Math.max(0, (90 - overallAvgAccuracy) / 90); // 0 → 1

  const bigramScores: BigramWeakness[] = Object.entries(BIGRAM_DIFFICULTY).map(
    ([bigram, { label, baseDifficulty }]) => {
      // Personal error contribution: the lower your accuracy, the more every
      // hard bigram is amplified (you're likely struggling with all of them).
      const personalFactor = 0.6 + accuracyPenalty * 0.4;
      const errorRate = Math.min(100, Math.round(baseDifficulty * personalFactor));
      return { bigram, errorRate, label };
    }
  );

  // Sort descending by computed error rate, take top 5
  const weakBigrams = bigramScores
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 5);

  // ── Coaching tip ──────────────────────────────────────────────────────────
  const improvementTip = buildImprovementTip(
    weakBigrams,
    weakModes,
    overallAvgAccuracy,
    overallAvgWpm,
  );

  // ── Generate practice text ────────────────────────────────────────────────
  const practiceText = generateWeaknessPracticeText(weakBigrams, overallAvgAccuracy);

  return {
    hasEnoughData: true,
    overallAvgWpm,
    overallAvgAccuracy,
    overallErrorRate,
    weakBigrams,
    weakModes,
    improvementTip,
    practiceText,
  };
}

// ─── Practice Text Generator ──────────────────────────────────────────────────

export function generateWeaknessPracticeText(
  weakBigrams: BigramWeakness[],
  accuracy: number,
  targetWordCount = 40,
): string {
  if (weakBigrams.length === 0) {
    // Fallback: generic speed drill
    return 'the quick brown fox jumps over the lazy dog and then sprints back through the thick undergrowth';
  }

  // Build a weighted pool: top weak bigrams get more representation
  const drillPool: string[] = [];

  weakBigrams.forEach((wb, idx) => {
    const weight = weakBigrams.length - idx; // top bigram gets highest weight
    const words = BIGRAM_DRILL_WORDS[wb.bigram] ?? [];
    // Add words proportionally to the weight
    for (let w = 0; w < weight; w++) {
      drillPool.push(...words);
    }
  });

  if (drillPool.length === 0) {
    return 'the quick brown fox jumps over the lazy dog';
  }

  // Shuffle drill pool
  const shuffled = drillPool.sort(() => Math.random() - 0.5);

  const selectedWords: string[] = [];
  let drillIdx = 0;
  let fillerIdx = 0;

  // Aim for ~60% drill words, 40% natural fillers (keeps text readable)
  const drillRatio = accuracy < 85 ? 0.5 : 0.65;

  while (selectedWords.length < targetWordCount) {
    const useDrill = Math.random() < drillRatio;
    if (useDrill && drillIdx < shuffled.length) {
      selectedWords.push(shuffled[drillIdx % shuffled.length]);
      drillIdx++;
    } else {
      selectedWords.push(FILLERS[fillerIdx % FILLERS.length]);
      fillerIdx++;
    }
  }

  return selectedWords.join(' ');
}
