import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { TestResult, LeaderboardEntry, TestMode } from '../types';
import { getDefaultLeaderboard } from '../data/defaultLeaderboards';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL
const memoryLeaderboardCache = new Map<string, { data: LeaderboardEntry[]; timestamp: number }>();

function getCacheKey(mode: string, modeConfig: string): string {
  return `typeflow_lb_${mode}_${modeConfig}`;
}

export const dbService = {
  /**
   * Synchronously retrieve cached or bundled baseline leaderboard records (0ms latency)
   */
  getCachedLeaderboard(mode: string, modeConfig: string): LeaderboardEntry[] {
    const key = getCacheKey(mode, modeConfig);
    const inMem = memoryLeaderboardCache.get(key);
    if (inMem && inMem.data.length > 0) {
      return inMem.data;
    }

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.data) && parsed.data.length > 0) {
          memoryLeaderboardCache.set(key, parsed);
          return parsed.data;
        }
      }
    } catch {}

    return getDefaultLeaderboard(mode, modeConfig);
  },

  async saveTestResult(userId: string, result: TestResult): Promise<string | null> {
    if (!isSupabaseConfigured() || !supabase) return null;

    const row = {
      user_id: userId,
      mode: result.mode,
      mode_config: result.modeConfig,
      wpm: result.wpm,
      net_wpm: result.netWpm,
      raw_wpm: result.rawWpm,
      burst_wpm: result.burstWpm || 0,
      speed_loss_wpm: result.speedLossWpm || 0,
      accuracy: result.accuracy,
      consistency: result.consistency || 100,
      stamina_ratio: result.staminaRatio || 100,
      total_chars: result.totalChars,
      correct_chars: result.correctChars,
      incorrect_chars: result.incorrectChars,
      extra_chars: result.extraChars || 0,
      missed_chars: result.missedChars || 0,
      elapsed_seconds: result.elapsedSeconds,
      is_personal_best: Boolean(result.isPersonalBest),
      timeline: result.timeline || [],
      created_at: result.timestamp ? new Date(result.timestamp).toISOString() : new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('test_results')
      .insert(row)
      .select('id')
      .single();

    if (error) {
      console.error('[dbService] Failed to save test to cloud:', error);
      throw error;
    }

    // Invalidate local cache for this category so next leaderboard view fetches newest scores
    const cacheKey = getCacheKey(result.mode, result.modeConfig);
    memoryLeaderboardCache.delete(cacheKey);
    try {
      localStorage.removeItem(cacheKey);
    } catch {}

    return data?.id || null;
  },

  async fetchUserHistory(userId: string, limit: number = 100): Promise<TestResult[]> {
    if (!isSupabaseConfigured() || !supabase) return [];

    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[dbService] Failed to fetch user history:', error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      timestamp: new Date(row.created_at).getTime(),
      mode: row.mode as TestMode,
      modeConfig: row.mode_config,
      wpm: Number(row.wpm),
      netWpm: Number(row.net_wpm),
      rawWpm: Number(row.raw_wpm),
      burstWpm: Number(row.burst_wpm || 0),
      speedLossWpm: Number(row.speed_loss_wpm || 0),
      accuracy: Number(row.accuracy),
      consistency: Number(row.consistency || 100),
      staminaRatio: Number(row.stamina_ratio || 100),
      totalChars: Number(row.total_chars),
      correctChars: Number(row.correct_chars),
      incorrectChars: Number(row.incorrect_chars),
      extraChars: Number(row.extra_chars || 0),
      missedChars: Number(row.missed_chars || 0),
      elapsedSeconds: Number(row.elapsed_seconds),
      isPersonalBest: Boolean(row.is_personal_best),
      timeline: Array.isArray(row.timeline) ? row.timeline : [],
    }));
  },

  async fetchPersonalBests(userId: string): Promise<Record<string, number>> {
    if (!isSupabaseConfigured() || !supabase) return {};

    const history = await this.fetchUserHistory(userId, 500);
    const pbs: Record<string, number> = {};

    history.forEach((test) => {
      const key = `${test.mode}-${test.modeConfig}`;
      if (!pbs[key] || test.wpm > pbs[key]) {
        pbs[key] = test.wpm;
      }
    });

    return pbs;
  },

  async fetchLeaderboard(
    mode: string = 'time',
    modeConfig: string = '30s',
    limit: number = 25,
    forceRefresh: boolean = false
  ): Promise<LeaderboardEntry[]> {
    const key = getCacheKey(mode, modeConfig);

    // 1. Check in-memory / local storage cache if not forcing refresh
    if (!forceRefresh) {
      const inMem = memoryLeaderboardCache.get(key);
      const now = Date.now();
      if (inMem && now - inMem.timestamp < CACHE_TTL_MS && inMem.data.length > 0) {
        return inMem.data;
      }

      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed.data) && now - parsed.timestamp < CACHE_TTL_MS) {
            memoryLeaderboardCache.set(key, parsed);
            return parsed.data;
          }
        }
      } catch {}
    }

    // 2. Fetch fresh scores from Supabase cloud
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('leaderboards')
          .select('*')
          .eq('mode', mode)
          .eq('mode_config', modeConfig)
          .order('wpm', { ascending: false })
          .limit(limit);

        if (!error && data && data.length > 0) {
          const entries = data as LeaderboardEntry[];
          // Update cache
          const payload = { data: entries, timestamp: Date.now() };
          memoryLeaderboardCache.set(key, payload);
          try {
            localStorage.setItem(key, JSON.stringify(payload));
          } catch {}
          return entries;
        }

        // Fallback query if leaderboards view is pending
        const { data: fallbackData } = await supabase
          .from('test_results')
          .select(`
            id,
            user_id,
            mode,
            mode_config,
            wpm,
            raw_wpm,
            accuracy,
            consistency,
            elapsed_seconds,
            created_at,
            profiles (
              username,
              display_name,
              avatar_url
            )
          `)
          .eq('mode', mode)
          .eq('mode_config', modeConfig)
          .order('wpm', { ascending: false })
          .limit(limit);

        if (fallbackData && fallbackData.length > 0) {
          const entries = fallbackData.map((row: any) => ({
            test_id: row.id,
            user_id: row.user_id,
            username: row.profiles?.username || 'Typist',
            display_name: row.profiles?.display_name || row.profiles?.username || 'Typist',
            avatar_url: row.profiles?.avatar_url || '',
            mode: row.mode as TestMode,
            mode_config: row.mode_config,
            wpm: row.wpm,
            raw_wpm: row.raw_wpm,
            accuracy: row.accuracy,
            consistency: row.consistency,
            elapsed_seconds: row.elapsed_seconds,
            created_at: row.created_at,
          }));

          const payload = { data: entries, timestamp: Date.now() };
          memoryLeaderboardCache.set(key, payload);
          try {
            localStorage.setItem(key, JSON.stringify(payload));
          } catch {}
          return entries;
        }
      } catch (err) {
        console.warn('[dbService] Cloud leaderboard fetch notice:', err);
      }
    }

    // 3. Fallback to bundled offline dataset
    return this.getCachedLeaderboard(mode, modeConfig);
  },

  async clearUserHistory(userId: string): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return;

    const { error } = await supabase
      .from('test_results')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },
};
