# WasteWise — Recycle. Earn. Repeat.

A smart recycling machine that rewards you for every bottle and packet you recycle. Scan your QR, drop your waste, earn points.

**Live site:** `site/index.html` (pure HTML/CSS/JS, no build step)

## Features
- Hero with scroll progress + lightweight parallax
- How it works (4 steps), What we collect, Rewards, Gamification, Impact counters
- Responsive, liquid-glass design, `prefers-reduced-motion` support

## Structure
```
wastewise/
└── site/
    ├── index.html
    ├── style.css
    ├── script.js
    └── logo.jpeg
```

## Run locally
Just open `site/index.html` in a browser, or:
```bash
npx serve site
python -m http.server --directory site 8000
```

## Deploy (GitHub Pages)
This repo is ready for GitHub Pages:
1. Go to repo Settings → Pages
2. Source: `Deploy from a branch` → Branch: `main` → Folder: `/site`
3. Save — site will be at `https://Ishan-113.github.io/Wastewise/`

© 2026 WasteWise · Smart Eco Recycling & Reward System
