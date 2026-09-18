import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import { LiveStatsBar } from './components/LiveStatsBar';
import { TypingArea } from './components/TypingArea';
import { ResultsModal } from './components/ResultsModal';
import { HistoryModal } from './components/HistoryModal';
import { ShortcutsBar } from './components/ShortcutsBar';
import { InteractiveLearningCard } from './components/InteractiveLearningCard';
import { InteractiveDsaCard } from './components/InteractiveDsaCard';
import { ProfileModal } from './components/ProfileModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTypingEngine } from './hooks/useTypingEngine';
import { useSoundEffects } from './hooks/useSoundEffects';
import { THEMES } from './constants/themes';
import { TestResult, ThemeConfig, TestSettings } from './types';
import {
  getActiveLearnItem,
  getNextLearnItemId,
  getActiveDsaChallenge,
  getNextDsaChallengeId,
} from './utils/textGenerator';

export function App() {
  const {
    settings,
    setSettings,
    history,
    personalBests,
    profile,
    updateProfile,
    resetProfile,
    saveTestResult,
    clearHistory,
  } = useLocalStorage();

  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(() => {
    return THEMES.find((t) => t.id === settings.themeId) || THEMES[0];
  });

  const [completedResult, setCompletedResult] = useState<TestResult | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

  const handleTestCompleted = useCallback((result: TestResult) => {
    playSuccessSound();
    const { isPB } = saveTestResult(result);
    setCompletedResult({ ...result, isPersonalBest: isPB });
  }, [playSuccessSound, saveTestResult]);

  // Core typing engine
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

  // Keyboard shortcut listener: Tab to restart, Esc to clear modal
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Tab key restarts test
      if (e.key === 'Tab') {
        e.preventDefault();
        setCompletedResult(null);
        initializeNewTest();
        return;
      }

      // Escape key closes modals
      if (e.key === 'Escape') {
        if (isProfileOpen) {
          setIsProfileOpen(false);
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
  }, [initializeNewTest, isProfileOpen, isHistoryOpen, completedResult]);

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between transition-colors duration-300">
      {/* Top Navbar */}
      <Header
        currentThemeId={activeTheme.id}
        onThemeChange={handleThemeChange}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenHistory={() => setIsHistoryOpen(true)}
        profile={profile}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-5xl w-full mx-auto">
        {completedResult ? (
          <ResultsModal
            result={completedResult}
            onNextTest={handleNextTest}
            onRepeatTest={handleRepeatTest}
          />
        ) : (
          <div className="w-full space-y-8 animate-in fade-in duration-300">
            {/* Mode selection pills */}
            <ModeSelector
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              disabled={status === 'running'}
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
            />

            {/* Bottom Shortcuts reference */}
            <ShortcutsBar onRestart={handleNextTest} />
          </div>
        )}
      </main>

      {/* Profile & Account Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onUpdateProfile={updateProfile}
        onResetProfile={resetProfile}
        history={history}
        personalBests={personalBests}
      />

      {/* Persistent History & Personal Best Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        personalBests={personalBests}
        onClearHistory={clearHistory}
      />

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto py-6 px-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-theme-sub gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-theme-main animate-pulse" />
          <span>Client-Side Engine &middot; 100% Offline Capable</span>
        </div>
        <div>
          <span>TypeFlow &mdash; Built for Speed & Focus</span>
        </div>
      </footer>
    </div>
  );
}

export default App;





