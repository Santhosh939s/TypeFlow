import { COMMON_WORDS } from '../constants/wordLists';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailyRecord {
  wpm: number;
  accuracy: number;
  completedAt: number; // Unix timestamp ms
}

const STORAGE_KEY = 'typeflow_daily_records';

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function getTodayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ─── Seeded random number generator (Mulberry32) ──────────────────────────────
// Deterministic PRNG — same seed always produces the same sequence.
// We seed from the date string so all users get the same text each day.

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateStringToSeed(dateKey: string): number {
  // Convert "2026-09-20" → numeric seed
  return dateKey.split('-').reduce((acc, part, i) => acc + parseInt(part, 10) * Math.pow(100, 2 - i), 0);
}

// ─── Daily text generator ─────────────────────────────────────────────────────

const DAILY_WORD_COUNT = 50;

export function getDailyText(dateKey?: string): string {
  const key = dateKey ?? getTodayKey();
  const seed = dateStringToSeed(key);
  const rand = mulberry32(seed);

  // Shuffle a copy of COMMON_WORDS using our seeded RNG (Fisher-Yates)
  const pool = [...COMMON_WORDS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Pick DAILY_WORD_COUNT words from the shuffled pool
  const selected: string[] = [];
  for (let i = 0; i < DAILY_WORD_COUNT; i++) {
    selected.push(pool[i % pool.length]);
  }

  return selected.join(' ');
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

export function getAllDailyRecords(): Record<string, DailyRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function hasDoneToday(): boolean {
  const records = getAllDailyRecords();
  return !!records[getTodayKey()];
}

export function getTodayRecord(): DailyRecord | null {
  const records = getAllDailyRecords();
  return records[getTodayKey()] ?? null;
}

/**
 * Saves today's daily challenge result and returns the updated streak.
 * Won't overwrite if already completed today (returns existing streak).
 */
export function saveDailyRecord(wpm: number, accuracy: number): number {
  const records = getAllDailyRecords();
  const todayKey = getTodayKey();

  // Only save the first completion of the day
  if (!records[todayKey]) {
    records[todayKey] = { wpm, accuracy, completedAt: Date.now() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      // Storage full — silently continue
    }
  }

  return computeStreak(records);
}

// ─── Streak computation ───────────────────────────────────────────────────────

function computeStreak(records: Record<string, DailyRecord>): number {
  const today = new Date();

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  let streak = 0;
  const cursor = new Date(today);

  // If today is done, start counting from today; otherwise start from yesterday
  if (!records[fmt(cursor)]) {
    cursor.setDate(cursor.getDate() - 1);
    if (!records[fmt(cursor)]) return 0;
  }

  while (records[fmt(cursor)]) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getDailyStreak(): number {
  return computeStreak(getAllDailyRecords());
}
