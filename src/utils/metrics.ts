import { TestMetrics, TimelineSample } from '../types';

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

  // Consistency score calculation based on second-by-second variance
  let consistency = 100;
  if (timeline.length > 2) {
    const samples = timeline.map(s => s.wpm).filter(v => v > 0);
    if (samples.length > 1) {
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      if (mean > 0) {
        const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;
        const stdDev = Math.sqrt(variance);
        // Coefficient of variation: stdDev / mean
        const cv = (stdDev / mean) * 100;
        consistency = Math.max(0, Math.min(100, Math.round(100 - cv)));
      }
    }
  }

  return {
    wpm,
    netWpm,
    rawWpm,
    accuracy,
    totalChars,
    correctChars,
    incorrectChars,
    extraChars,
    missedChars,
    elapsedSeconds: Math.round(elapsedSeconds),
    consistency,
  };
}
