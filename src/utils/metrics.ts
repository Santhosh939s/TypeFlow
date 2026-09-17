import { TestMetrics, TimelineSample, TestResult, DailyActivity } from '../types';

export function calculateMetrics(
  correctChars: number,
  incorrectChars: number,
  extraChars: number,
  missedChars: number,
  elapsedSeconds: number,
  timeline: TimelineSample[] = []
): TestMetrics {
  const totalChars = correctChars + incorrectChars + extraChars;
  const minutes = Math.max(0.001, elapsedSeconds / 60);

  // Standard typing measurement: 5 keystrokes count as 1 word
  const rawWpm = Math.round((totalChars / 5) / minutes);
  const wpm = Math.round((correctChars / 5) / minutes);
  
  // Net WPM penalizes errors
  const netWpm = Math.max(0, Math.round(((correctChars - incorrectChars) / 5) / minutes));

  // Accuracy percentage
  const accuracy = totalChars > 0 
    ? Math.min(100, Math.max(0, parseFloat(((correctChars / totalChars) * 100).toFixed(1))))
    : 100;

  // Accuracy Tax / Speed Loss: Speed directly forfeited due to typing errors
  const speedLossWpm = Math.max(0, rawWpm - netWpm);

  // Peak Burst Speed: Highest rolling instantaneous speed in the session
  let burstWpm = Math.max(wpm, rawWpm);
  if (timeline.length > 0) {
    const peakTimelineWpm = Math.max(...timeline.map(s => Math.max(s.wpm, s.rawWpm)));
    if (peakTimelineWpm > burstWpm) {
      burstWpm = peakTimelineWpm;
    }
  }

  // Consistency score calculation based on second-by-second variance
  let consistency = 100;
  if (timeline.length > 2) {
    const samples = timeline.map(s => s.wpm).filter(v => v > 0);
    if (samples.length > 1) {
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      if (mean > 0) {
        const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;
        const stdDev = Math.sqrt(variance);
        const cv = (stdDev / mean) * 100;
        consistency = Math.max(0, Math.min(100, Math.round(100 - cv)));
      }
    }
  }

  // Stamina / Pace Balance: 2nd half speed compared to 1st half
  let staminaRatio = 100;
  if (timeline.length >= 4) {
    const mid = Math.floor(timeline.length / 2);
    const firstHalf = timeline.slice(0, mid);
    const secondHalf = timeline.slice(mid);
    const firstAvg = firstHalf.reduce((a, b) => a + b.wpm, 0) / Math.max(1, firstHalf.length);
    const secondAvg = secondHalf.reduce((a, b) => a + b.wpm, 0) / Math.max(1, secondHalf.length);
    if (firstAvg > 0) {
      staminaRatio = Math.round((secondAvg / firstAvg) * 100);
    }
  }

  return {
    wpm,
    netWpm,
    rawWpm,
    burstWpm,
    speedLossWpm,
    accuracy,
    totalChars,
    correctChars,
    incorrectChars,
    extraChars,
    missedChars,
    elapsedSeconds: Math.round(elapsedSeconds),
    consistency,
    staminaRatio,
  };
}

/**
 * Aggregates test sessions into daily activity map for the Heatmap calendar
 */
export function generateDailyActivityMap(history: TestResult[]): Record<string, DailyActivity> {
  const map: Record<string, DailyActivity> = {};

  history.forEach(test => {
    const dateObj = new Date(test.timestamp);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    if (!map[dateKey]) {
      map[dateKey] = {
        date: dateKey,
        count: 0,
        avgWpm: 0,
        bestWpm: 0,
        timeSeconds: 0,
      };
    }

    const current = map[dateKey];
    const newCount = current.count + 1;
    current.avgWpm = Math.round((current.avgWpm * current.count + test.wpm) / newCount);
    current.bestWpm = Math.max(current.bestWpm, test.wpm);
    current.timeSeconds += test.elapsedSeconds;
    current.count = newCount;
  });

  return map;
}

/**
 * Calculates current active daily streak from test history
 */
export function calculateStreak(history: TestResult[]): number {
  if (!history || history.length === 0) return 0;

  const activityMap = generateDailyActivityMap(history);
  const today = new Date();
  
  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  let streak = 0;
  const checkDate = new Date(today);

  // Check if active today, if not check if active yesterday to continue streak
  const todayKey = formatDate(checkDate);
  if (!activityMap[todayKey]) {
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayKey = formatDate(checkDate);
    if (!activityMap[yesterdayKey]) {
      return 0;
    }
  }

  while (true) {
    const key = formatDate(checkDate);
    if (activityMap[key] && activityMap[key].count > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Exports history to a CSV file download
 */
export function exportHistoryToCSV(history: TestResult[]): void {
  if (!history || history.length === 0) return;

  const headers = [
    'Test ID',
    'Date & Time',
    'Mode',
    'Config',
    'Net WPM',
    'Raw WPM',
    'Accuracy (%)',
    'Consistency (%)',
    'Burst WPM',
    'Speed Loss (WPM)',
    'Stamina (%)',
    'Correct Chars',
    'Incorrect Chars',
    'Extra Chars',
    'Missed Chars',
    'Time (s)'
  ];

  const rows = history.map(t => [
    t.id,
    new Date(t.timestamp).toISOString(),
    t.mode,
    `"${t.modeConfig}"`,
    t.wpm,
    t.rawWpm ?? t.wpm,
    t.accuracy,
    t.consistency ?? 100,
    t.burstWpm ?? t.wpm,
    t.speedLossWpm ?? 0,
    t.staminaRatio ?? 100,
    t.correctChars,
    t.incorrectChars,
    t.extraChars,
    t.missedChars,
    t.elapsedSeconds
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `typeflow-records-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
