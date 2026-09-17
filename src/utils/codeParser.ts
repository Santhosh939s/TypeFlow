export interface CodeLineStructure {
  lineIndex: number;
  indent: number;
  wordIndices: number[];
}

export interface ParsedTextStructure {
  words: string[];
  lines: CodeLineStructure[];
  isCodeMode: boolean;
}

/**
 * Splits input text into discrete words while preserving line breaks and indentation levels for code mode.
 */
export function parseTextStructure(text: string, isCodeMode: boolean): ParsedTextStructure {
  if (!isCodeMode || !text.includes('\n')) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    return {
      words,
      lines: [
        {
          lineIndex: 0,
          indent: 0,
          wordIndices: words.map((_, i) => i),
        },
      ],
      isCodeMode: false,
    };
  }

  const rawLines = text.split('\n');
  const words: string[] = [];
  const lines: CodeLineStructure[] = [];

  rawLines.forEach((rawLine) => {
    // Determine leading whitespace indentation level (2 spaces = 1 indent step)
    const match = rawLine.match(/^( +)/);
    const leadingSpaces = match ? match[1].length : 0;
    const indent = Math.floor(leadingSpaces / 2);

    const lineTokens = rawLine.trim().split(/\s+/).filter(w => w.length > 0);
    if (lineTokens.length === 0) return;

    const wordIndices: number[] = [];
    lineTokens.forEach(token => {
      const idx = words.length;
      words.push(token);
      wordIndices.push(idx);
    });

    lines.push({
      lineIndex: lines.length,
      indent,
      wordIndices,
    });
  });

  return {
    words,
    lines,
    isCodeMode: true,
  };
}
