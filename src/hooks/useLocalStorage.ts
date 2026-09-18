import { useState, useEffect } from 'react';
import { TestResult, TestSettings, UserProfile } from '../types';
import { generateRandomUsername } from '../utils/nameGenerator';

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

const createDefaultProfile = (): UserProfile => {
  const name = generateRandomUsername();
  return {
    username: name,
    title: 'Keyboard Speedster',
    bio: 'Typing at the speed of thought with TypeFlow.',
    customAvatar: null,
    avatarSeed: name,
    joinedDate: new Date().toISOString().split('T')[0],
  };
};

export function useLocalStorage() {
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

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('typeflow_profile');
      if (saved) {
        return JSON.parse(saved);
      }
      const initial = createDefaultProfile();
      localStorage.setItem('typeflow_profile', JSON.stringify(initial));
      return initial;
    } catch {
      return createDefaultProfile();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('typeflow_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('typeflow_profile', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save profile:', e);
      }
      return updated;
    });
  };

  const resetProfile = () => {
    const fresh = createDefaultProfile();
    setProfile(fresh);
    try {
      localStorage.setItem('typeflow_profile', JSON.stringify(fresh));
    } catch (e) {
      console.error('Failed to reset profile:', e);
    }
  };

  const saveTestResult = (result: TestResult): { isPB: boolean; previousPB: number } => {
    const key = `${result.mode}-${result.modeConfig}`;
    const prevPB = personalBests[key] || 0;
    const isPB = result.wpm > prevPB;

    const newResult = {
      ...result,
      isPersonalBest: isPB,
    };

    const newHistory = [newResult, ...history].slice(0, 50); // keep last 50
    setHistory(newHistory);
    try {
      localStorage.setItem('typeflow_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save history:', e);
    }

    if (isPB) {
      const newPBs = { ...personalBests, [key]: result.wpm };
      setPersonalBests(newPBs);
      try {
        localStorage.setItem('typeflow_pbs', JSON.stringify(newPBs));
      } catch (e) {
        console.error('Failed to save PB:', e);
      }
    }

    return { isPB, previousPB: prevPB };
  };

  const clearHistory = () => {
    setHistory([]);
    setPersonalBests({});
    try {
      localStorage.removeItem('typeflow_history');
      localStorage.removeItem('typeflow_pbs');
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  };

  return {
    settings,
    setSettings,
    history,
    personalBests,
    profile,
    updateProfile,
    resetProfile,
    saveTestResult,
    clearHistory,
  };
}

