# Tongue & Groove

A speech practice web app for adults with motor speech disorders (dysarthria, apraxia of speech) — paced word drills weighted toward the sound categories the user finds hardest.

**Live app:** https://tonguegroove-app.github.io/tongue-and-groove/
Installable as a PWA (iPhone: **Safari only** → Share → Add to Home Screen; Android: Chrome → Install). Works fully offline after first load. Not a medical device; a practice tool, not therapy.

## Features

- **Words** — adaptive drill over a 1,122-word library of motor-difficult words, in six sound categories (TH, 3-consonant clusters, L-blends, R-blends, S-blends, final clusters), weighted by a one-time 1–5 self-assessment
- **Sound pairs** — minimal-pair drills (shoe/Sue, thin/fin)
- **Sentences** — read-along with the current word highlighted
- **Scenarios** — functional vocabulary packs for real situations (restaurant, doctor visit, work, phone calls, family, shopping)
- Self-paced (tap Next) or auto-paced (10–150 words per minute)
- Progress: daily rings, streak, day/week/month charts — all computed from real practice history
- Dark mode, adjustable text size, 44px+ touch targets, `prefers-reduced-motion` respected

## Adaptive selection

Word lists are ordered by conversational frequency (wordfreq top 3,000, three tiers). Each category starts with its 40 most common words:

- Words tapped as **hard** on the end-of-set screen appear **3×** as often and can't retire until the flag cools down (one level per clean set appearance)
- **5 exposures** with no hard mark → the word graduates to a review pool that still gets **10%** of picks
- When fewer than 25 un-graduated words remain, the next 15 most-common words unlock

Tuning constants at the top of `src/App.jsx` (`GRAD_X`, `HARD_BOOST`, `REVIEW_P`, `ACTIVE_START`, `ACTIVE_MIN`, `ACTIVE_STEP`).

## Mobile hardening

Wake lock while auto-paced (screen never sleeps mid-drill) · auto-pause when backgrounded (never silently resumes) · `100dvh` + safe-area insets · offline via service worker (app shell, word data, fonts) · illustrated install instructions shown in-browser until installed.

## Stack & structure

Vite + React, no backend. All user data lives in `localStorage` (`tg-state-v1`): ratings, settings, per-word stats, per-day history.

```
src/
  App.jsx        # entire UI + drill/selection logic
  data.js        # pairs, sentences, categories, scenario packs, goals
  words.gen.js   # GENERATED tiered word lists — do not edit by hand
  storage.js     # localStorage + date-key helpers
scripts/
  build_words.py # regenerates words.gen.js from wordfreq (python3, pip install wordfreq)
  make-icons.mjs # regenerates public/icons/ (npm run icons)
```

## Develop & deploy

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```

Every push to `main` auto-builds and deploys via GitHub Actions → GitHub Pages (`.github/workflows/deploy.yml`). To regenerate the word library: `python3 scripts/build_words.py`, then commit `src/words.gen.js`.
