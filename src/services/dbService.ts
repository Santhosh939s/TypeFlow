import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { TestResult, LeaderboardEntry, TestMode } from '../types';

export const dbService = {
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
    modeConfig: string = '30',
    limit: number = 20
  ): Promise<LeaderboardEntry[]> {
    if (!isSupabaseConfigured() || !supabase) return [];

    try {
      // First try querying the helper view if created
      const { data, error } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('mode', mode)
        .eq('mode_config', modeConfig)
        .order('wpm', { ascending: false })
        .limit(limit);

      if (!error && data) {
        return data as LeaderboardEntry[];
      }

      // Fallback: direct join between test_results and profiles
      const { data: fallbackData, error: fallbackError } = await supabase
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

      if (fallbackError || !fallbackData) {
        return [];
      }

      return fallbackData.map((row: any) => ({
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
    } catch (err) {
      console.warn('[dbService] fetchLeaderboard error:', err);
      return [];
    }
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
