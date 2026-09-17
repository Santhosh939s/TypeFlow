# TypeFlow ⚡

> A modern, lightning-fast, and minimalist client-side typing practice web application with real-time metrics, SVG pace analytics, multi-mode passage generation, activity heatmaps, and offline persistence.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-teal)
![Vite](https://img.shields.io/badge/Vite-6-purple)

---

## ✨ Features

- **Precision Typing Engine & Smooth Caret**:
  - Smooth animated caret anchored precisely to characters as you type.
  - Character-by-character color highlighting (green for correct, red/underline for mistakes, dimmed for upcoming).
  - Virtual and physical keyboard support across Windows, macOS, Linux, and mobile touch devices.

- **Activity Heatmap & Practice Calendar**:
  - **20-Week Activity Heatmap**: Interactive GitHub/Monkeytype-style calendar grid tracking daily practice frequency and intensity.
  - **Active Streak Tracker**: Automatic daily streak counter (`🔥 Day Streak`) to reward continuous practice habits.
  - **Interactive Hover Tooltips**: Instant view of tests completed, average speed, peak speed, and practice time for any day.

- **Advanced Performance & Bottleneck Analytics**:
  - **Net WPM & Raw WPM**: Total keystroke velocity alongside penalty-adjusted net typing speed.
  - **Peak Burst Speed (Max Velocity)**: Peak instantaneous speed achieved during any rolling window.
  - **Speed Loss (Accuracy Tax)**: Real-time calculation of `Raw WPM - Net WPM`, showing exactly how many words per minute typos cost you.
  - **Pacing Stamina Ratio**: Evaluates 1st half vs. 2nd half speed to detect *Sprint Finish*, *Even Pace*, or *Fatigue Fade*.
  - **Rhythm Consistency (%)**: Mathematical coefficient-of-variation measuring second-by-second cadence stability.

- **Practice Dashboard & CSV Export**:
  - Detailed modal aggregating total tests, total typing time (`HH:MM:SS`), peak personal records, all-time averages, and last 10-test averages.
  - **Export CSV**: Download complete local typing session history as a `.csv` spreadsheet for personal tracking.

- **Multiple Practice Modes**:
  - **Time Countdown**: 15s, 30s, 60s, 120s
  - **Word Count**: 10, 25, 50, 100 words
  - **Code Practice**: JavaScript, TypeScript, Python, HTML/CSS snippets
  - **Quotes**: Curated programming and philosophy quotes
  - **Modifiers**: Optional `@ Punctuation` and `# Numbers` injection

- **Performance Progression SVG Chart**:
  - Post-test speed trajectory graph with keystroke error markers and second-by-second pace analytics.

- **Synthesized Mechanical Switch Audio**:
  - Tactile keyboard sound effects synthesized client-side via the **Web Audio API** (zero external audio file dependencies).

- **Theme Customizer**:
  - 6 curated themes: Cyber Emerald, Tokyo Night, Amber Horizon, Matrix Code, Nordic Frost, and Dracula.

- **100% Offline & Private**:
  - Powered by `localStorage` — no login, no accounts, and no data leaves your device.

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS & CSS Custom Properties
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Sound**: Web Audio API (native synthetic oscillator)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Santhosh939s/TypeFlow.git

# Navigate to project directory
cd TypeFlow

# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🤝 Contributing & Branching Workflow

1. **Start from the latest main branch**:
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Create your feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make changes & test**:
   ```bash
   npm run dev
   npm run build
   ```
4. **Stage and commit**:
   ```bash
   git add .
   git commit -m "feat: describe your change"
   ```
5. **Push to GitHub & open a Pull Request**:
   ```bash
   git push -u origin feature/your-feature-name
   ```

---

## 📄 License
MIT License.
