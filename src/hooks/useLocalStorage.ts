import { useState, useEffect, useCallback, useRef } from 'react';
import { TestResult, TestSettings, UserProfile } from '../types';
import { authService } from '../services/authService';
import { dbService } from '../services/dbService';
import { isSupabaseConfigured } from '../lib/supabaseClient';

const DEFAULT_SETTINGS: TestSettings = {
  mode: 'time',
  timeDuration: 30,
  wordCount: 25,
  codeLanguage: 'javascript',
  learnCategory: 'all',
  selectedLearnId: 'ml-overfitting',
  selectedDsaId: 'dsa-fibonacci',
  dsaLanguage: 'python',
  includePunctuation: false,
  includeNumbers: false,
  soundEnabled: true,
  themeId: 'cyber-emerald',
};

export function useLocalStorage() {
  const isConfigured = isSupabaseConfigured();
  const initialFetchDone = useRef<string | null>(null);

  const [settings, setSettings] = useState<TestSettings>(() => {
    try {
      const saved = localStorage.getItem('typeflow_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [history, setHistory] = useState<TestResult[]>(() => {
    try {
      const saved = localStorage.getItem('typeflow_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [personalBests, setPersonalBests] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('typeflow_pbs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(false);

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    return authService.getInitialUser();
  });

  // Settings persistence
  useEffect(() => {
    try {
      localStorage.setItem('typeflow_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  // Load cloud history & personal bests directly from Supabase when user has id
  useEffect(() => {
    if (!profile?.id || !isConfigured) {
      initialFetchDone.current = null;
      return;
    }

    if (initialFetchDone.current === profile.id) return;
    initialFetchDone.current = profile.id;

    const loadCloudData = async () => {
      setIsLoadingCloud(true);
      try {
        const cloudHistory = await dbService.fetchUserHistory(profile.id!, 100);
        const cloudPBs = await dbService.fetchPersonalBests(profile.id!);
        if (cloudHistory.length > 0) setHistory(cloudHistory);
        if (Object.keys(cloudPBs).length > 0) setPersonalBests(cloudPBs);
      } catch (err) {
        console.warn('[useLocalStorage] Cloud fetch error:', err);
      } finally {
        setIsLoadingCloud(false);
      }
    };

    loadCloudData();
  }, [profile?.id, isConfigured]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      authService.saveUser(updated);
      return updated;
    });
  };

  const loginUser = (newProfile: UserProfile) => {
    setProfile(newProfile);
    authService.saveUser(newProfile);
  };

  const logoutUser = async () => {
    setProfile(null);
    await authService.signOut();
  };

  const saveTestResult = useCallback(
    (result: TestResult): { isPB: boolean; previousPB: number } => {
      const key = `${result.mode}-${result.modeConfig}`;
      const prevPB = personalBests[key] || 0;
      const isPB = result.wpm > prevPB;

      const newResult: TestResult = {
        ...result,
        isPersonalBest: isPB,
      };

      // Optimistically update live session state
      setHistory((prev) => {
        const next = [newResult, ...prev].slice(0, 100);
        try {
          localStorage.setItem('typeflow_history', JSON.stringify(next));
        } catch {}
        return next;
      });

      if (isPB) {
        setPersonalBests((prev) => {
          const next = { ...prev, [key]: result.wpm };
          try {
            localStorage.setItem('typeflow_pbs', JSON.stringify(next));
          } catch {}
          return next;
        });
      }

      // Save directly to Supabase cloud database if user has an id
      if (profile?.id && isConfigured) {
        dbService
          .saveTestResult(profile.id, newResult)
          .then((cloudId) => {
            if (cloudId) {
              setHistory((current) =>
                current.map((item) => (item.id === newResult.id ? { ...item, id: cloudId } : item))
              );
            }
          })
          .catch((err) => {
            console.error('[useLocalStorage] Failed to save test to Supabase:', err);
          });
      }

      return { isPB, previousPB: prevPB };
    },
    [personalBests, profile?.id, isConfigured]
  );

  const clearHistory = useCallback(async () => {
    setHistory([]);
    setPersonalBests({});
    try {
      localStorage.removeItem('typeflow_history');
      localStorage.removeItem('typeflow_pbs');
    } catch {}

    if (profile?.id && isConfigured) {
      try {
        await dbService.clearUserHistory(profile.id);
      } catch (e) {
        console.warn('Failed to clear cloud history:', e);
      }
    }
  }, [profile?.id, isConfigured]);

  return {
    settings,
    setSettings,
    history,
    personalBests,
    profile,
    updateProfile,
    loginUser,
    logoutUser,
    saveTestResult,
    clearHistory,
    isLoadingCloud,
  };
}
