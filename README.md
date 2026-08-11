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

## Supabase (auth + progress)

1. Enable **Google** + **Email** providers in Authentication.
2. Add redirect URL: `http://localhost:3000/auth/callback`
3. Run SQL from [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor (creates `learner_progress` with RLS).

## Python pronunciation server

```bash
cd python_server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# if needed: pip install requests
uvicorn main:app --host 0.0.0.0 --port 8000
```

Scoring uses Faster-Whisper speech-to-text + text similarity (not phoneme diagnostics).

## Features

- Search words/idioms with definitions
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

## Localization

UI strings live in:

- `i18n/en.json` — English
- `i18n/my.json` — Burmese (default)

```tsx
const t = useT();
t.nav.home
fmt(t.search.noMatchesDescription, { query })
```
