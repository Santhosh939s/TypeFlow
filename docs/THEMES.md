# 🎨 Themes & Custom Aesthetics Guide

TypeFlow features a dynamic design system powered by CSS variables and tailored color palettes.

## Built-In Themes

* **Cyber Emerald**: High-contrast neon green with deep carbon blacks.
* **Tokyo Night**: Sleek indigo and violet palette inspired by modern IDE dark themes.
* **Carbon Minimal**: Monochrome aesthetic designed for distraction-free focus.
* **Warm Amber**: Vintage retro terminal glow with soothing amber accents.

## Theme Architecture

Themes dynamically bind to root CSS custom properties:
```css
:root {
  --color-bg: #...;
  --color-card: #...;
  --color-main: #...;
  --color-sub: #...;
  --color-text: #...;
  --color-caret: #...;
}
```

New themes can be easily defined in `src/constants/themes.ts`.
