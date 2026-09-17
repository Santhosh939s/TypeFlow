import { COMMON_WORDS, PUNCTUATION_MARKS } from '../constants/wordLists';
import { CODE_SNIPPETS } from '../constants/codeSnippets';
import { FAMOUS_QUOTES } from '../constants/quotes';
import { LEARN_CONCEPTS } from '../constants/learnConcepts';
import { DSA_CHALLENGES } from '../constants/dsaChallenges';
import { TestSettings, LearnItem, DsaChallenge, LearnCategory } from '../types';

export function getActiveLearnItem(settings: TestSettings): LearnItem {
  if (settings.selectedLearnId) {
    const found = LEARN_CONCEPTS.find(item => item.id === settings.selectedLearnId);
    if (found) return found;
  }
  const pool = settings.learnCategory === 'all'
    ? LEARN_CONCEPTS
    : LEARN_CONCEPTS.filter(item => item.category === settings.learnCategory);
  return pool[0] || LEARN_CONCEPTS[0];
}

export function getNextLearnItemId(currentId: string, category: LearnCategory): string {
  const pool = category === 'all'
    ? LEARN_CONCEPTS
    : LEARN_CONCEPTS.filter(item => item.category === category);
  const currentIndex = pool.findIndex(item => item.id === currentId);
  const nextIndex = (currentIndex + 1) % pool.length;
  return pool[nextIndex].id;
}

export function getActiveDsaChallenge(settings: TestSettings): DsaChallenge {
  if (settings.selectedDsaId) {
    const found = DSA_CHALLENGES.find(c => c.id === settings.selectedDsaId);
    if (found) return found;
  }
  return DSA_CHALLENGES[0];
}

export function getNextDsaChallengeId(currentId: string): string {
  const currentIndex = DSA_CHALLENGES.findIndex(c => c.id === currentId);
  const nextIndex = (currentIndex + 1) % DSA_CHALLENGES.length;
  return DSA_CHALLENGES[nextIndex].id;
}

export function generateTestText(settings: TestSettings): string {
  // 1. Learn Mode: Concepts & Definitions
  if (settings.mode === 'learn') {
    const activeItem = getActiveLearnItem(settings);
    return activeItem.definition;
  }

  // 2. DSA Challenges: Coding Algorithms
  if (settings.mode === 'dsa') {
    const activeChallenge = getActiveDsaChallenge(settings);
    const lang = settings.dsaLanguage || 'python';
    return activeChallenge.solutions[lang] || activeChallenge.solutions.python;
  }

  // 3. General Code Snippets
  if (settings.mode === 'code') {
    const snippetsForLang = CODE_SNIPPETS.filter(s => s.language === settings.codeLanguage);
    const pool = snippetsForLang.length > 0 ? snippetsForLang : CODE_SNIPPETS;
    const randomSnippet = pool[Math.floor(Math.random() * pool.length)];
    return randomSnippet.code;
  }

  // 4. Quotes Mode
  if (settings.mode === 'quotes') {
    const randomQuote = FAMOUS_QUOTES[Math.floor(Math.random() * FAMOUS_QUOTES.length)];
    return randomQuote.text;
  }

  // 5. Standard Time & Words Modes
  let count = 40;
  if (settings.mode === 'words') {
    count = settings.wordCount;
  } else if (settings.mode === 'time') {
    count = Math.max(80, settings.timeDuration * 3);
  }

  const selectedWords: string[] = [];
  const wordPool = [...COMMON_WORDS];

  for (let i = 0; i < count; i++) {
    if (settings.includeNumbers && Math.random() < 0.12) {
      const randomNum = Math.floor(Math.random() * 999) + 1;
      selectedWords.push(randomNum.toString());
      continue;
    }

    const randomIndex = Math.floor(Math.random() * wordPool.length);
    let word = wordPool[randomIndex];

    if (settings.includePunctuation) {
      const prevWord = selectedWords[selectedWords.length - 1];
      if (i === 0 || (prevWord && /[.?!]$/.test(prevWord))) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }

      if (Math.random() < 0.22) {
        const pMark = PUNCTUATION_MARKS[Math.floor(Math.random() * PUNCTUATION_MARKS.length)];
        if (pMark === '"' || pMark === '(') {
          word = `"${word}"`;
        } else {
          word = `${word}${pMark}`;
        }
      }
    }

    selectedWords.push(word);
  }

  if (settings.includePunctuation && selectedWords.length > 0) {
    const lastIdx = selectedWords.length - 1;
    if (!/[.?!]$/.test(selectedWords[lastIdx])) {
      selectedWords[lastIdx] = selectedWords[lastIdx] + '.';
    }
  }

  return selectedWords.join(' ');
}
