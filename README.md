# TypeFlow ⚡

> A modern, lightning-fast, and minimalist client-side typing practice web application with real-time metrics, SVG pace analytics, multi-mode passage generation, and offline persistence.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-teal)
![Vite](https://img.shields.io/badge/Vite-6-purple)

---

## 🚀 Features

- **Precision Typing Engine**: Real-time calculation of **Net WPM**, **Raw WPM**, **Accuracy (%)**, and **Speed Consistency (%)**.
- **Smooth Caret & Live Feedback**: Floating animated caret with instant character-by-character color highlighting (green for correct, red/underline for mistakes, gray for upcoming).
- **Multiple Practice Modes**:
  - **Time Countdown**: 15s, 30s, 60s, 120s
  - **Word Count**: 10, 25, 50, 100 words
  - **Code Practice**: JavaScript, TypeScript, Python, HTML/CSS snippets
  - **Quotes**: Curated programming and philosophy quotes
  - **Modifiers**: Optional `@ Punctuation` and `# Numbers` injection
- **Performance Breakdown & SVG Chart**: Post-test speed trajectory graph with keystroke error markers and second-by-second analytics.
- **Mechanical Switch Audio**: Tactile keyboard sound effects synthesized client-side via **Web Audio API** (zero audio file dependencies).
- **Theme Customizer**: 6 curated dark themes (Cyber Emerald, Tokyo Night, Amber Horizon, Matrix Code, Nordic Frost, Dracula).
- **Local Persistence**: `localStorage` records for personal bests (PB) and test history without requiring user authentication.

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS & CSS Custom Properties
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Sound**: Web Audio API (native synthetic oscillator)

---

## 📦 Getting Started

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

## 🤝 Contributing & Branching Guide

We welcome contributions from team members and friends! Follow these steps to contribute:

1. **Clone and Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** and test locally:
   ```bash
   npm run build
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "Add feature: your feature description"
   ```
4. **Push your branch to GitHub**:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request (PR)** on GitHub for review!

---

## 📄 License
MIT License. Feel free to use, modify, and distribute.
