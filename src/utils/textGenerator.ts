import { COMMON_WORDS, PUNCTUATION_MARKS } from '../constants/wordLists';
import { CODE_SNIPPETS } from '../constants/codeSnippets';
import { FAMOUS_QUOTES } from '../constants/quotes';
import { TestSettings } from '../types';

export function generateTestText(settings: TestSettings): string {
  if (settings.mode === 'code') {
    const snippetsForLang = CODE_SNIPPETS.filter(s => s.language === settings.codeLanguage);
    const pool = snippetsForLang.length > 0 ? snippetsForLang : CODE_SNIPPETS;
    const randomSnippet = pool[Math.floor(Math.random() * pool.length)];
    return randomSnippet.code;
  }

  if (settings.mode === 'quotes') {
    const randomQuote = FAMOUS_QUOTES[Math.floor(Math.random() * FAMOUS_QUOTES.length)];
    return randomQuote.text;
  }

  // Determine word count needed
  let count = 40;
  if (settings.mode === 'words') {
    count = settings.wordCount;
  } else if (settings.mode === 'time') {
    // For time mode, ensure ample words so user doesn't hit the end
    count = Math.max(80, settings.timeDuration * 3);
  }

  const selectedWords: string[] = [];
  const wordPool = [...COMMON_WORDS];

  for (let i = 0; i < count; i++) {
    // Occasionally insert a number if enabled
    if (settings.includeNumbers && Math.random() < 0.12) {
      const randomNum = Math.floor(Math.random() * 999) + 1;
      selectedWords.push(randomNum.toString());
      continue;
    }

    const randomIndex = Math.floor(Math.random() * wordPool.length);
    let word = wordPool[randomIndex];

    if (settings.includePunctuation) {
      // Capitalize first word or word following sentence end
      const prevWord = selectedWords[selectedWords.length - 1];
      if (i === 0 || (prevWord && /[.?!]$/.test(prevWord))) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }

      // Add punctuation mark
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

  // Ensure last word has a period if punctuation is on
  if (settings.includePunctuation && selectedWords.length > 0) {
    const lastIdx = selectedWords.length - 1;
    if (!/[.?!]$/.test(selectedWords[lastIdx])) {
      selectedWords[lastIdx] = selectedWords[lastIdx] + '.';
    }
  }

  return selectedWords.join(' ');
}
