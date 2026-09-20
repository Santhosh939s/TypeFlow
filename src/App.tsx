import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import { LiveStatsBar } from './components/LiveStatsBar';
import { TypingArea } from './components/TypingArea';
import { ResultsModal } from './components/ResultsModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { HistoryModal } from './components/HistoryModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { AuthModal } from './components/AuthModal';
import { ShortcutsBar } from './components/ShortcutsBar';
import { InteractiveLearningCard } from './components/InteractiveLearningCard';
import { InteractiveDsaCard } from './components/InteractiveDsaCard';
import { ProfileModal } from './components/ProfileModal';
import { useLocalStorage, DEFAULT_SETTINGS } from './hooks/useLocalStorage';
import { useTypingEngine } from './hooks/useTypingEngine';
import { useSoundEffects } from './hooks/useSoundEffects';
import { useAuth } from './context/AuthContext';
import { THEMES } from './constants/themes';
import { TestResult, ThemeConfig, TestSettings } from './types';
import {
  getActiveLearnItem,
  getNextLearnItemId,
  getActiveDsaChallenge,
  getNextDsaChallengeId,
} from './utils/textGenerator';
import {
  getDailyStreak,
  saveDailyRecord,
  hasDoneToday,
} from './utils/dailyChallenge';

export function App() {
  const { user, isConfigured } = useAuth();

  const {
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
  } = useLocalStorage();

  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(() => {
    return THEMES.find((t) => t.id === settings.themeId) || THEMES[0];
  });

  const [completedResult, setCompletedResult] = useState<TestResult | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Daily challenge state
  const [dailyStreak, setDailyStreak] = useState<number>(() => getDailyStreak());
  const [dailyAlreadyDone, setDailyAlreadyDone] = useState<boolean>(() => hasDoneToday());

  const isAnyModalOpen = isAuthOpen || isProfileOpen || isHistoryOpen || isLeaderboardOpen || !!completedResult;

  // Mechanical switch audio effects hook
  const { playKeySound, playErrorSound, playSuccessSound } = useSoundEffects(settings.soundEnabled);

  // Apply theme CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    const colors = activeTheme.colors;
    root.style.setProperty('--color-bg', colors.bg);
    root.style.setProperty('--color-card', colors.card);
    root.style.setProperty('--color-sub', colors.sub);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-main', colors.main);
    root.style.setProperty('--color-error', colors.error);
    root.style.setProperty('--color-error-extra', colors.errorExtra);
    root.style.setProperty('--color-caret', colors.caret);
  }, [activeTheme]);

  const handleTestCompleted = useCallback(
    (result: TestResult) => {
      playSuccessSound();
      const { isPB } = saveTestResult(result);
      const finalResult = { ...result, isPersonalBest: isPB };

      // Daily Challenge: save to daily records and compute streak
      if (result.mode === 'daily') {
        const newStreak = saveDailyRecord(result.wpm, result.accuracy);
        setDailyStreak(newStreak);
        setDailyAlreadyDone(true);
      }

      setCompletedResult(finalResult);
    },
    [playSuccessSound, saveTestResult]
  );

  // Core typing engine — timeline is tracked internally and surfaced via result.timeline
  const {
    text,
    words,
    currentWordIndex,
    currentInput,
    typedWords,
    status,
    timeLeft,
    elapsedTime,
    liveMetrics,
    handleKeyDown,
    handleMobileInput,
    initializeNewTest,
    repeatCurrentTest,
  } = useTypingEngine(settings, handleTestCompleted, playKeySound, playErrorSound);

  // Theme change handler
  const handleThemeChange = (theme: ThemeConfig) => {
    setActiveTheme(theme);
    setSettings((prev: TestSettings) => ({ ...prev, themeId: theme.id }));
  };

  // Toggle audio
  const handleToggleSound = () => {
    setSettings((prev: TestSettings) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  // Setting updates
  const handleUpdateSettings = (updates: Partial<TestSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    setCompletedResult(null);
    initializeNewTest(undefined, newSettings);
  };

  // Start a fresh test
  const handleNextTest = () => {
    setCompletedResult(null);
    initializeNewTest();
  };

  // Repeat same test
  const handleRepeatTest = () => {
    setCompletedResult(null);
    repeatCurrentTest();
  };

  // Next Learn Concept
  const handleNextConcept = () => {
    const nextId = getNextLearnItemId(settings.selectedLearnId || 'ml-overfitting', settings.learnCategory);
    setSettings(prev => ({ ...prev, selectedLearnId: nextId }));
    setCompletedResult(null);
    initializeNewTest();
  };

  // Next DSA Challenge
  const handleNextChallenge = () => {
    const nextId = getNextDsaChallengeId(settings.selectedDsaId || 'dsa-fibonacci');
    setSettings(prev => ({ ...prev, selectedDsaId: nextId }));
    setCompletedResult(null);
    initializeNewTest();
  };

  // Reset back to original homepage state (Time mode, 30s)
  const handleResetToHome = () => {
    setIsAuthOpen(false);
    setIsProfileOpen(false);
    setIsLeaderboardOpen(false);
    setIsHistoryOpen(false);
    setCompletedResult(null);

    const resetSettings: TestSettings = {
      ...DEFAULT_SETTINGS,
      soundEnabled: settings.soundEnabled,
      themeId: settings.themeId,
    };
    setSettings(resetSettings);
    initializeNewTest(undefined, resetSettings);
  };

  // Keyboard shortcut listener: Tab to restart, Esc to clear modals
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const isTypingInInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable) &&
        activeEl.getAttribute('aria-label') !== 'Typing input box';

      // If user is inside a form input, never intercept (except Escape to dismiss)
      if (isTypingInInput) {
        if (e.key === 'Escape') {
          if (isAuthOpen) setIsAuthOpen(false);
          if (isProfileOpen) setIsProfileOpen(false);
          if (isLeaderboardOpen) setIsLeaderboardOpen(false);
        }
        return;
      }

      // Tab key restarts test ONLY if no modal is active
      if (e.key === 'Tab') {
        if (isAnyModalOpen) {
          return; // Allow native Tab switching inside forms & modals
        }
        e.preventDefault();
        setCompletedResult(null);
        initializeNewTest();
        return;
      }

      // Escape key closes modals
      if (e.key === 'Escape') {
        if (isAuthOpen) {
          setIsAuthOpen(false);
          return;
        }
        if (isProfileOpen) {
          setIsProfileOpen(false);
          return;
        }
        if (isLeaderboardOpen) {
          setIsLeaderboardOpen(false);
          return;
        }
        if (isHistoryOpen) {
          setIsHistoryOpen(false);
          return;
        }
        if (completedResult) {
          setCompletedResult(null);
          initializeNewTest();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [initializeNewTest, isAnyModalOpen, isAuthOpen, isProfileOpen, isLeaderboardOpen, isHistoryOpen, completedResult]);

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between transition-colors duration-300">
      {/* Top Navbar */}
      <Header
        currentThemeId={activeTheme.id}
        onThemeChange={handleThemeChange}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        profile={profile}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onResetToHome={handleResetToHome}
        dailyStreak={dailyStreak}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 lg:px-12 py-6 sm:py-8 w-full max-w-[1500px] mx-auto">
        {completedResult ? (
          /* Show Daily Challenge modal for daily mode, standard modal for everything else */
          completedResult.mode === 'daily' ? (
            <DailyChallengeModal
              result={completedResult}
              streak={dailyStreak}
              alreadyDoneToday={dailyAlreadyDone}
              onNextTest={handleNextTest}
              onRepeatTest={handleRepeatTest}
            />
          ) : (
            <ResultsModal
              result={completedResult}
              onNextTest={handleNextTest}
              onRepeatTest={handleRepeatTest}
            />
          )
        ) : (
          <div className="w-full space-y-8 animate-in fade-in duration-300">
            {/* Mode selection pills */}
            <ModeSelector
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />

            {/* Live Stats display & progress bar */}
            <LiveStatsBar
              metrics={liveMetrics}
              mode={settings.mode}
              timeLeft={timeLeft}
              totalDuration={settings.timeDuration}
              currentWordIndex={currentWordIndex}
              totalWords={words.length}
              status={status}
              elapsedTime={elapsedTime}
            />

            {/* Interactive Concept Card (Learn Mode) */}
            {settings.mode === 'learn' && (
              <InteractiveLearningCard
                item={getActiveLearnItem(settings)}
                onNext={handleNextConcept}
              />
            )}

            {/* Interactive Problem Card (DSA Challenges Mode) */}
            {settings.mode === 'dsa' && (
              <InteractiveDsaCard
                challenge={getActiveDsaChallenge(settings)}
                currentLanguage={settings.dsaLanguage || 'python'}
                onNext={handleNextChallenge}
              />
            )}

            {/* Main Interactive Typing Area */}
            <TypingArea
              text={text}
              mode={settings.mode}
              words={words}
              currentWordIndex={currentWordIndex}
              currentInput={currentInput}
              typedWords={typedWords}
              onKeyDown={handleKeyDown}
              onMobileInput={handleMobileInput}
              status={status}
              disabled={isAnyModalOpen}
            />

            {/* Bottom Shortcuts reference */}
            <ShortcutsBar onRestart={handleNextTest} />
          </div>
        )}
      </main>

      {/* Auth Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          loginUser(user);
          setIsAuthOpen(false);
        }}
      />

      {/* Profile & Account Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onUpdateProfile={updateProfile}
        onSignOut={logoutUser}
        history={history}
        personalBests={personalBests}
        onStartDrill={(text) => {
          setIsProfileOpen(false);
          initializeNewTest(text);
        }}
      />

      {/* Persistent History & Analytics Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        personalBests={personalBests}
        onClearHistory={clearHistory}
      />

      {/* Community Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full max-w-[1500px] mx-auto py-6 px-4 sm:px-8 lg:px-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-theme-sub gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              user && isConfigured
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-theme-main animate-pulse'
            }`}
          />
          <span>
            {user && isConfigured
              ? '100% Online &middot; Cloud Database Connected'
              : isConfigured
              ? 'Online Platform &middot; Sign in to record stats'
              : 'Supabase Database Setup Required'}
          </span>
        </div>
        <div>
          <span>TypeFlow &mdash; Built for Speed & Focus</span>
        </div>
      </footer>
    </div>
  );
}

export default App;





