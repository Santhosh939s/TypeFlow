import { useState, useEffect, useCallback, useRef } from 'react';
import { TestResult, TestSettings } from '../types';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';

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
  const { user, isConfigured } = useAuth();
  const initialFetchDone = useRef<string | null>(null);

  const [settings, setSettings] = useState<TestSettings>(() => {
    try {
      const saved = localStorage.getItem('typeflow_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [history, setHistory] = useState<TestResult[]>([]);
  const [personalBests, setPersonalBests] = useState<Record<string, number>>({});
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(false);

  // Settings persistence
  useEffect(() => {
    try {
      localStorage.setItem('typeflow_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  // Load cloud history & personal bests directly from Supabase when user signs in
  useEffect(() => {
    if (!user || !isConfigured) {
      initialFetchDone.current = null;
      setHistory([]);
      setPersonalBests({});
      return;
    }

    if (initialFetchDone.current === user.id) return;
    initialFetchDone.current = user.id;

    const loadCloudData = async () => {
      setIsLoadingCloud(true);
      try {
        const cloudHistory = await dbService.fetchUserHistory(user.id, 100);
        const cloudPBs = await dbService.fetchPersonalBests(user.id);
        setHistory(cloudHistory);
        setPersonalBests(cloudPBs);
      } catch (err) {
        console.warn('[useLocalStorage] Cloud fetch error:', err);
      } finally {
        setIsLoadingCloud(false);
      }
    };

    loadCloudData();
  }, [user, isConfigured]);

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
      setHistory((prev) => [newResult, ...prev].slice(0, 100));

      if (isPB) {
        setPersonalBests((prev) => ({ ...prev, [key]: result.wpm }));
      }

      // Save directly to Supabase cloud database
      if (user && isConfigured) {
        dbService
          .saveTestResult(user.id, newResult)
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
    [personalBests, user, isConfigured]
  );

  const clearHistory = useCallback(async () => {
    setHistory([]);
    setPersonalBests({});

    if (user && isConfigured) {
      try {
        await dbService.clearUserHistory(user.id);
      } catch (e) {
        console.warn('Failed to clear cloud history:', e);
      }
    }
  }, [user, isConfigured]);

  return {
    settings,
    setSettings,
    history,
    personalBests,
    saveTestResult,
    clearHistory,
    isLoadingCloud,
  };
}
