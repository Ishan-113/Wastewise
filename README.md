# WasteWise — Recycle. Earn. Repeat.

A smart recycling machine that rewards you for every bottle and packet you recycle. Scan your QR, drop your waste, earn points.

**Live site:** `frontend/index.html` (pure HTML/CSS/JS, no build step)

## Features
- Hero with scroll progress + lightweight parallax
- How it works (4 steps), What we collect, Rewards, Gamification, Impact counters
- Responsive, liquid-glass design, `prefers-reduced-motion` support

## Structure
```
wastewise/
└── frontend/
    ├── index.html
    ├── style.css
    ├── script.js
    └── logo.jpeg
```

## Run locally
Just open `frontend/index.html` in a browser, or:
```bash
npx serve frontend
python -m http.server --directory frontend 8000
```

## Deploy (GitHub Pages)
This repo is ready for GitHub Pages:
1. Go to repo Settings → Pages
2. Source: `Deploy from a branch` → Branch: `main` → Folder: `/frontend`
3. Save — site will be at `https://Ishan-113.github.io/Wastewise/`

© 2026 WasteWise · Smart Eco Recycling & Reward System
