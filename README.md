# Idiomify

Master pronunciation, idioms, and vocabulary through gamified AI learning.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — landing page with **Get Started**, then the learning console at `/dashboard`.

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_or_publishable_key"
NEXT_PUBLIC_PYTHON_SCORE_URL="http://localhost:8000/score"
```

## Supabase (auth + progress + optional content)

1. Enable **Google** + **Email** providers in Authentication.
2. Add redirect URL: `http://localhost:3000/auth/callback`
3. Run SQL from [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor.
4. *(Optional)* Seed `words` / `idioms` tables — see [`supabase/seed-content.example.sql`](supabase/seed-content.example.sql).  
   If those tables are empty or missing, the app falls back to `data/words.json` and `data/idioms.json`.

## Content sources

| Source | Role |
|--------|------|
| `data/*.json` | Curated fallback for games, practice, idioms browse |
| Supabase `words` / `idioms` | Optional live catalog (used by `/api/content` when seeded) |
| [Free Dictionary API](https://dictionaryapi.dev/) | Live search enrichment (no API key) via `/api/define` |

Search flow: curated library first, then Free Dictionary for extra definitions.

## Python pronunciation server

```bash
cd python_server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# if needed: pip install requests
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Scoring uses Faster-Whisper speech-to-text + text similarity (not phoneme diagnostics).

## Features

- Search words/idioms (curated library + Free Dictionary enrichment)
- Practice speaking with accuracy % + word mismatch highlight
- Games: Easy (MCQ / Matching), Medium (Cloze / Listening), Hard (timed speaking)
- Badges, points, Burmese/English UI
- Google / email login; progress syncs to Supabase when signed in
- Settings page for account + reset progress

## Demo tips

- Use **Chrome** on desktop for mic / speech features.
- If the mic or Python server fails, use **Demo Mode** on Practice / Hard.
- Reset local progress from **Settings** or **Badges**.

See [prd.md](prd.md) for full requirements.

## PWA

Production builds register a service worker via [Serwist](https://serwist.pages.dev/):

```bash
npm run build && npm start
# or
npm run start:prod
```

- Manifest: `/manifest.webmanifest`
- Offline fallback: `/offline`
- Installable icons: `public/icons/`

Service worker is **disabled in `next dev`** (Turbopack). Use a production build to test install / offline.

**Important:** `next dev` rewrites `.next/` in a way that breaks `npm start` (`routesManifest.dataRoutes is not iterable`). Always run a fresh `npm run build` before `npm start` (or use `npm run start:prod`). Don’t keep `npm run dev` running against the same `.next` folder you plan to start.

UI strings live in:

- `i18n/en.json` — English
- `i18n/my.json` — Burmese (default)

```tsx
const t = useT();
t.nav.home
fmt(t.search.noMatchesDescription, { query })
```
