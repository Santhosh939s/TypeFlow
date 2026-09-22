import React, { useState, useMemo } from 'react';
import {
  Brain,
  Zap,
  BarChart2,
  AlertTriangle,
  CheckCircle,
  Play,
  RefreshCw,
  Target,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Sparkles,
  ChevronRight,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { TestResult } from '../types';
import { analyzeWeaknesses, generateWeaknessPracticeText } from '../utils/weaknessAnalyzer';
import {
  AI_LESSONS,
  AiLesson,
  AiPracticeParagraph,
  getNextNonRepeatingParagraph,
  recordPracticedParagraph,
  getLessonPracticedCount,
  getRecentPracticedIds,
} from '../constants/aiLessons';

interface WeaknessTrainerProps {
  history: TestResult[];
  onStartDrill: (text: string) => void;
}

export const WeaknessTrainer: React.FC<WeaknessTrainerProps> = ({ history, onStartDrill }) => {
  // Memoize analysis so it only recomputes when history changes
  const report = useMemo(() => analyzeWeaknesses(history), [history]);

  // View state: Guided Lessons vs Adaptive Drill
  const [viewMode, setViewMode] = useState<'lessons' | 'adaptive'>('lessons');

  // Selected lesson track
  const [selectedLessonId, setSelectedLessonId] = useState<string>(AI_LESSONS[0].id);

  // Current paragraph to display for the selected lesson track
  const [currentParagraph, setCurrentParagraph] = useState<AiPracticeParagraph>(() =>
    getNextNonRepeatingParagraph(AI_LESSONS[0].id)
  );

  // Practiced count trigger to re-render practice status badges
  const [practicedVersion, setPracticedVersion] = useState(0);

  // Active lesson object
  const activeLesson = useMemo(
    () => AI_LESSONS.find((l) => l.id === selectedLessonId) || AI_LESSONS[0],
    [selectedLessonId]
  );

  // When switching lessons, load a non-repeating paragraph for that lesson
  const handleSelectLesson = (lesson: AiLesson) => {
    setSelectedLessonId(lesson.id);
    const nextP = getNextNonRepeatingParagraph(lesson.id);
    setCurrentParagraph(nextP);
  };

  // Cycle to next non-repeating paragraph within current lesson
  const handleShuffleParagraph = () => {
    const nextP = getNextNonRepeatingParagraph(selectedLessonId, currentParagraph.id);
    setCurrentParagraph(nextP);
  };

  // Start practicing the current guided lesson paragraph
  const handleStartLesson = () => {
    recordPracticedParagraph(currentParagraph.id);
    setPracticedVersion((v) => v + 1);
    onStartDrill(currentParagraph.text);
  };

  // Regenerate a fresh drill text for adaptive weaknesses
  const handleRegenerateAdaptiveDrill = () => {
    if (!report.hasEnoughData) return;
    const freshText = generateWeaknessPracticeText(report.weakBigrams, report.overallAvgAccuracy);
    onStartDrill(freshText);
  };

  // Recent total practiced count across all lessons
  const totalRecentPracticed = useMemo(() => {
    void practicedVersion;
    return getRecentPracticedIds().length;
  }, [practicedVersion]);

  // Practiced count for currently selected lesson
  const lessonPracticedCount = useMemo(() => {
    void practicedVersion;
    return getLessonPracticedCount(selectedLessonId);
  }, [selectedLessonId, practicedVersion]);

  return (
    <div className="space-y-5">
      {/* ── Top Navigation / View Mode Switcher ──────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 p-1 bg-white/[0.04] border border-white/10 rounded-xl">
        <button
          onClick={() => setViewMode('lessons')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'lessons'
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
              : 'text-theme-sub hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen size={14} />
          <span>AI Practice Lessons</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
            {AI_LESSONS.reduce((acc, l) => acc + l.paragraphs.length, 0)}
          </span>
        </button>

        <button
          onClick={() => setViewMode('adaptive')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'adaptive'
              ? 'bg-theme-main text-black shadow-lg shadow-theme-main/20'
              : 'text-theme-sub hover:text-white hover:bg-white/5'
          }`}
        >
          <Brain size={14} />
          <span>Adaptive Analysis</span>
          {report.hasEnoughData && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* VIEW 1: AI GUIDED LESSONS (NON-REPEATING)                               */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'lessons' && (
        <div className="space-y-4">
          {/* Track categories strip */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-sub flex items-center gap-1.5">
                <Layers size={13} className="text-purple-400" />
                Select Skill Track ({AI_LESSONS.length} tracks available)
              </span>
              {totalRecentPracticed > 0 && (
                <span className="text-[10px] text-purple-300/80 font-mono">
                  {totalRecentPracticed} paragraphs practiced
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AI_LESSONS.map((lesson) => {
                const isSelected = lesson.id === selectedLessonId;
                const practiced = getLessonPracticedCount(lesson.id);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson)}
                    className={`p-2.5 rounded-xl text-left border transition-all relative overflow-hidden group ${
                      isSelected
                        ? `${lesson.color} ring-1 ring-white/20 shadow-md`
                        : 'bg-white/[0.02] border-white/5 text-theme-sub hover:border-white/20 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-xs font-bold truncate leading-tight">
                        {lesson.title.split('&')[0].trim()}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                          isSelected ? lesson.badgeBg : 'bg-white/5 text-theme-sub border-white/10'
                        }`}
                      >
                        {lesson.difficulty[0]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] opacity-75">
                      <span className="truncate">{lesson.paragraphs.length} paragraphs</span>
                      {practiced > 0 && (
                        <span className="font-mono text-[9px] text-emerald-400 font-bold">
                          ✓ {practiced}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Lesson Detail Banner */}
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-white space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-purple-400" />
                  {activeLesson.title}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {activeLesson.difficulty}
                </span>
              </div>
              <div className="text-[11px] font-mono text-purple-300/80">
                Non-Repeating Rotation: {lessonPracticedCount}/{activeLesson.paragraphs.length} completed
              </div>
            </div>

            <p className="text-xs text-theme-sub leading-relaxed">{activeLesson.shortDesc}</p>

            {/* Target Bigrams / Skills pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] uppercase font-semibold text-theme-sub mr-1">Focus Keys:</span>
              {activeLesson.targetSkills.map((skill) => (
                <span
                  key={skill}
                  className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white/10 text-purple-200 border border-white/10"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Current Practice Paragraph Card */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={13} className="text-purple-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  {currentParagraph.title}
                </h4>
                <span className="text-[10px] font-mono text-theme-sub">
                  ({currentParagraph.wordCount} words)
                </span>
              </div>

              {/* Shuffle / Next Paragraph Button */}
              <button
                onClick={handleShuffleParagraph}
                title="Load a fresh non-repeating paragraph from this track"
                className="text-[11px] font-semibold text-purple-300 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all group"
              >
                <RefreshCw size={11} className="group-hover:rotate-180 transition-transform duration-300" />
                <span>Next Paragraph</span>
              </button>
            </div>

            {/* Monospace Reading/Typing Preview */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 font-mono text-sm text-theme-sub leading-relaxed tracking-wide select-none">
              {currentParagraph.text}
            </div>

            {/* Paragraph Coaching Tip */}
            <div className="flex items-start gap-2 text-xs text-theme-sub/90 bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
              <Zap size={13} className="text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Form Tip: </strong>
                {currentParagraph.tip}
              </span>
            </div>
          </div>

          {/* Primary CTA: Start Lesson */}
          <button
            onClick={handleStartLesson}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm active:scale-[0.98] transition-all shadow-lg shadow-purple-500/25 cursor-pointer"
          >
            <Play size={16} fill="currentColor" />
            <span>Start Practice Lesson Now</span>
            <ArrowRight size={14} className="ml-1 opacity-80" />
          </button>

          <p className="text-[10px] text-center text-theme-sub/50">
            Lessons automatically cycle through fresh paragraphs and record progress so you never repeat drills.
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* VIEW 2: ADAPTIVE WEAKNESS DRILL (PERSONALIZED STATS)                   */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'adaptive' && (
        <div className="space-y-5">
          {!report.hasEnoughData ? (
            /* Adaptive Drill: Needs at least 3 tests completed */
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="w-14 h-14 rounded-2xl bg-theme-main/10 border border-theme-main/20 flex items-center justify-center text-theme-main">
                <Brain size={28} />
              </div>
              <div className="max-w-sm">
                <h3 className="text-sm font-bold text-white mb-1.5">
                  Personalized Analysis Unlocking Soon
                </h3>
                <p className="text-xs text-theme-sub leading-relaxed">
                  {report.improvementTip}
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      history.length >= n ? 'bg-theme-main' : 'bg-white/10'
                    }`}
                  />
                ))}
                <span className="text-xs font-mono text-theme-sub ml-1.5">
                  {history.length}/3 tests completed
                </span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setViewMode('lessons')}
                  className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  <BookOpen size={14} />
                  <span>Practice AI Guided Lessons Instead</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            /* Adaptive Drill: Unlocked with 3+ tests */
            <>
              {/* Overall stats */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-theme-sub uppercase tracking-wider mb-0.5">Avg WPM</div>
                  <div className="text-lg font-black text-theme-main">{report.overallAvgWpm}</div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-theme-sub uppercase tracking-wider mb-0.5">Avg Accuracy</div>
                  <div
                    className={`text-lg font-black ${
                      report.overallAvgAccuracy >= 95
                        ? 'text-emerald-400'
                        : report.overallAvgAccuracy >= 85
                        ? 'text-yellow-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {report.overallAvgAccuracy}%
                  </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-theme-sub uppercase tracking-wider mb-0.5">Error Rate</div>
                  <div
                    className={`text-lg font-black ${
                      report.overallErrorRate <= 3
                        ? 'text-emerald-400'
                        : report.overallErrorRate <= 8
                        ? 'text-yellow-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {report.overallErrorRate}%
                  </div>
                </div>
              </div>

              {/* Weak Bigrams */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <AlertTriangle size={13} className="text-yellow-400 shrink-0" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-sub">
                    Weak Character Patterns
                  </h4>
                  <span className="text-[10px] text-theme-sub/60 ml-auto">higher % = harder for you</span>
                </div>
                <div className="space-y-2">
                  {report.weakBigrams.map((wb, idx) => (
                    <div key={wb.bigram} className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-theme-sub/50 w-4 shrink-0 text-right">
                        #{idx + 1}
                      </span>
                      <span className="font-mono text-sm font-bold text-white bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1 min-w-[2.5rem] text-center shrink-0">
                        {wb.bigram}
                      </span>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            wb.errorRate >= 75
                              ? 'bg-rose-500'
                              : wb.errorRate >= 55
                              ? 'bg-yellow-400'
                              : 'bg-theme-main'
                          }`}
                          style={{ width: `${wb.errorRate}%` }}
                        />
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[11px] font-bold text-white">{wb.errorRate}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Speed by Mode */}
              {report.weakModes.length > 1 && (
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <BarChart2 size={13} className="text-theme-main shrink-0" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-sub">
                      Speed by Mode
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {report.weakModes.map((mode, idx) => {
                      const maxModeWpm = Math.max(...report.weakModes.map((m) => m.avgWpm), 1);
                      const isWeakest = idx === 0;
                      const isStrongest = idx === report.weakModes.length - 1;

                      return (
                        <div key={mode.mode} className="flex items-center gap-3">
                          <div className="w-20 shrink-0 text-right">
                            <span className="text-[11px] text-theme-sub truncate">
                              {mode.label.replace(' Mode', '')}
                            </span>
                          </div>
                          <div className="flex-1 h-4 bg-white/5 rounded-lg overflow-hidden relative">
                            <div
                              className={`h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2 ${
                                isWeakest
                                  ? 'bg-rose-500/30 border border-rose-500/20'
                                  : isStrongest
                                  ? 'bg-emerald-500/30 border border-emerald-500/20'
                                  : 'bg-theme-main/20 border border-theme-main/10'
                              }`}
                              style={{ width: `${Math.max(8, (mode.avgWpm / maxModeWpm) * 100)}%` }}
                            >
                              <span
                                className={`text-[10px] font-bold ${
                                  isWeakest
                                    ? 'text-rose-400'
                                    : isStrongest
                                    ? 'text-emerald-400'
                                    : 'text-theme-main'
                                }`}
                              >
                                {mode.avgWpm}
                              </span>
                            </div>
                          </div>
                          <div className="w-6 shrink-0">
                            {isWeakest ? (
                              <TrendingDown size={12} className="text-rose-400" />
                            ) : isStrongest ? (
                              <TrendingUp size={12} className="text-emerald-400" />
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Coaching Tip */}
              <div className="bg-theme-main/5 border border-theme-main/20 rounded-xl p-3.5 flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-theme-main/15 border border-theme-main/20 flex items-center justify-center text-theme-main shrink-0 mt-0.5">
                  <Target size={14} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-theme-main mb-0.5 flex items-center gap-1">
                    <Zap size={11} />
                    AI Coaching Tip
                  </div>
                  <p className="text-xs text-theme-sub leading-relaxed">{report.improvementTip}</p>
                </div>
              </div>

              {/* Generated Drill Text Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={13} className="text-theme-main shrink-0" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-sub">
                      Dynamically Generated Drill
                    </h4>
                  </div>
                  <button
                    onClick={handleRegenerateAdaptiveDrill}
                    className="text-[11px] text-theme-sub hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw size={11} />
                    Regenerate
                  </button>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5 font-mono text-sm text-theme-sub leading-relaxed tracking-wide break-words">
                  {report.practiceText}
                </div>

                <p className="text-[10px] text-theme-sub/50 mt-1.5">
                  Targets your weak bigrams: {report.weakBigrams.map((b) => b.bigram).join(', ')}
                </p>
              </div>

              {/* Adaptive CTA */}
              <button
                onClick={handleRegenerateAdaptiveDrill}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-theme-main text-black font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-theme-main/20 cursor-pointer"
              >
                <Play size={16} fill="currentColor" />
                <span>Start Adaptive Drill Now</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
