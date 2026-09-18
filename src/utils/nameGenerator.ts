/**
 * Random Developer Username & Title Generator
 * Provides suggestions, random tech-inspired names, and dev titles.
 */

const ADJECTIVES = [
  'Cyber',
  'Neon',
  'Quantum',
  'Binary',
  'Syntax',
  'Algo',
  'Pixel',
  'Hyper',
  'Turbo',
  'Vim',
  'Cosmic',
  'ZeroDay',
  'Kernel',
  'Matrix',
  'Apex',
  'Shadow',
  'Retro',
  'Vector',
  'Terminal',
  'Crypto',
  'Async',
  'Atomic',
  'Neural',
  'Stellar',
  'Silent',
  'Iron',
  'Nova',
  'Glitch',
];

const NOUNS = [
  'Typist',
  'Coder',
  'Falcon',
  'Samurai',
  'Ninja',
  'Knight',
  'Runner',
  'Hacker',
  'Wizard',
  'Architect',
  'Guru',
  'Pilot',
  'Viper',
  'Ghost',
  'Striker',
  'Sniper',
  'Operator',
  'Dev',
  'Specter',
  'Surfer',
  'Sage',
  'Pioneer',
  'Crafter',
  'Reaper',
];

export const DEFAULT_DEV_TITLES = [
  'Mechanical Key Enthusiast',
  'O(1) Typist',
  'Syntax Sorcerer',
  'Terminal Sorcerer',
  'Full-Stack Speedster',
  'Vim Maestro',
  'Algorithm Explorer',
  'Bug Hunter Extraordinaire',
  'Precision Key Specialist',
  'Code Artisan',
  'Linear Time Runner',
];

export function generateRandomUsername(withNumber = false): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = withNumber ? Math.floor(10 + Math.random() * 90) : '';
  return `${adj}${noun}${num}`;
}

export function getNameSuggestions(count = 4, excludeName = ''): string[] {
  const suggestions = new Set<string>();
  let attempts = 0;
  while (suggestions.size < count && attempts < 50) {
    attempts++;
    const name = generateRandomUsername(Math.random() > 0.65);
    if (name.toLowerCase() !== excludeName.toLowerCase()) {
      suggestions.add(name);
    }
  }
  return Array.from(suggestions);
}
