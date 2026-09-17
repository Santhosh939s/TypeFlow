import { ThemeConfig } from '../types';

export const THEMES: ThemeConfig[] = [
  {
    id: 'cyber-emerald',
    name: 'Cyber Emerald',
    colors: {
      bg: '#0c0f14',
      card: '#131822',
      sub: '#64748b',
      text: '#e2e8f0',
      main: '#10b981',      // Emerald 500
      error: '#f43f5e',     // Rose 500
      errorExtra: '#881337',
      caret: '#10b981',
    },
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    colors: {
      bg: '#1a1b26',
      card: '#24283b',
      sub: '#565f89',
      text: '#c0caf5',
      main: '#7aa2f7',      // Electric blue/cyan
      error: '#f7768e',
      errorExtra: '#9f1d35',
      caret: '#bb9af7',
    },
  },
  {
    id: 'amber-horizon',
    name: 'Amber Horizon',
    colors: {
      bg: '#121214',
      card: '#1b1b1f',
      sub: '#71717a',
      text: '#fafafa',
      main: '#f59e0b',      // Amber 500
      error: '#ef4444',
      errorExtra: '#7f1d1d',
      caret: '#f59e0b',
    },
  },
  {
    id: 'matrix-lime',
    name: 'Matrix Code',
    colors: {
      bg: '#0a0d0a',
      card: '#111711',
      sub: '#4b634b',
      text: '#d1fae5',
      main: '#22c55e',      // Lime green
      error: '#ef4444',
      errorExtra: '#7f1d1d',
      caret: '#4ade80',
    },
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    colors: {
      bg: '#0f172a',
      card: '#1e293b',
      sub: '#64748b',
      text: '#f1f5f9',
      main: '#38bdf8',      // Sky 400
      error: '#fb7185',
      errorExtra: '#881337',
      caret: '#38bdf8',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    colors: {
      bg: '#1e1f29',
      card: '#282a36',
      sub: '#6272a4',
      text: '#f8f8f2',
      main: '#bd93f9',      // Dracula Purple
      error: '#ff5555',
      errorExtra: '#991b1b',
      caret: '#ff79c6',
    },
  },
];
