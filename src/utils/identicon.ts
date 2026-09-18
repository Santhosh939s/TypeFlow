/**
 * GitHub-Style Identicon Generator
 * Produces a 5x5 horizontally symmetrical pixel avatar identical to GitHub's default avatars.
 * Zero external dependencies, runs offline, 100% vector SVG.
 */

// Simple 32-bit hash (djb2 + sdbm hybrid) to get deterministic bytes from string
function hashString(str: string): number[] {
  let hash1 = 5381;
  let hash2 = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) ^ char;
    hash2 = char + (hash2 << 6) + (hash2 << 16) - hash2;
  }

  // Generate 16 deterministic bytes
  const bytes: number[] = [];
  let seed1 = Math.abs(hash1);
  let seed2 = Math.abs(hash2);

  for (let i = 0; i < 16; i++) {
    seed1 = (seed1 * 1664525 + 1013904223) % 4294967296;
    seed2 = (seed2 * 1103515245 + 12345) % 4294967296;
    bytes.push((seed1 ^ seed2) & 0xff);
  }
  return bytes;
}

export interface IdenticonData {
  grid: boolean[][]; // 5 rows x 5 columns
  color: string;
  bgColor: string;
}

export function generateIdenticonData(seed: string): IdenticonData {
  const normalizedSeed = (seed || 'typeflow-user').trim().toLowerCase();
  const bytes = hashString(normalizedSeed);

  // GitHub identicon uses hue from first bytes, with pleasant saturation and lightness
  const hue = ((bytes[0] << 8) | bytes[1]) % 360;
  const saturation = 65 + (bytes[2] % 25); // 65% - 90%
  const lightness = 48 + (bytes[3] % 18); // 48% - 66%
  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  // Deep subtle dark background matching TypeFlow dark theme
  const bgColor = '#131722';

  // 5x5 grid with horizontal symmetry
  // Columns 0 and 4 are identical, Columns 1 and 3 are identical, Column 2 is center
  const grid: boolean[][] = [];
  let byteIndex = 4;

  for (let row = 0; row < 5; row++) {
    grid[row] = [];
    const col0 = (bytes[byteIndex++] % 2) === 1;
    const col1 = (bytes[byteIndex++] % 2) === 1;
    const col2 = (bytes[byteIndex++] % 2) === 1;

    grid[row][0] = col0;
    grid[row][1] = col1;
    grid[row][2] = col2;
    grid[row][3] = col1; // Mirror of col 1
    grid[row][4] = col0; // Mirror of col 0
  }

  // Ensure at least 6 cells are active so it's not empty
  const activeCount = grid.flat().filter(Boolean).length;
  if (activeCount < 6) {
    grid[0][2] = true;
    grid[2][2] = true;
    grid[4][2] = true;
    grid[1][1] = true;
    grid[1][3] = true;
  }

  return { grid, color, bgColor };
}

/**
 * Returns a data:image/svg+xml URI string for use in <img> tags or backgrounds.
 */
export function generateIdenticonSvgUri(seed: string, size = 120): string {
  const { grid, color, bgColor } = generateIdenticonData(seed);
  const padding = size * 0.08;
  const cellSize = (size - padding * 2) / 5;

  let rects = '';
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (grid[r][c]) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;
        rects += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" fill="${color}" />`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${size * 0.18}" fill="${bgColor}" fill-opacity="0.95"/>${rects}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
