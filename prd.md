# Idiomify — Product Requirements Document (PRD)

**Tagline:** Master Pronunciation, Idioms, and Vocabulary through Gamified AI Learning

**Document type:** Project Show / Exhibition  
**Status:** Draft  
**Last updated:** 2026-08-11

---

## 1. Overview

### 1.1 Product summary

**Idiomify** is an NLP-powered language learning web app that helps users practice English vocabulary and idioms through search, definitions, real-time pronunciation feedback, and gamified drills. It bridges passive learning (knowing a word) and active production (speaking it correctly).

### 1.2 Context

This PRD defines requirements for a **project show / demo**, not a production SaaS. Reliability for a live presentation matters more than scale, perfect phoneme accuracy, or enterprise auth.

### 1.3 Goals

- Demonstrate word/idiom search with clear definitions and examples.
- Capture microphone input and return a pronunciation accuracy score.
- Deliver Easy / Medium / Hard practice games with points.
- Organize idioms by category.
- Unlock badges based on learner milestones.
- Present a coherent end-to-end demo in a few minutes.

### 1.4 Non-goals (out of scope for show)

- Production-grade multi-user auth, payments, or social features.
- Native mobile apps.
- Perfect phoneme-level linguistic diagnostics.
- Large curated datasets (hundreds of idioms).
- Offline-first PWA or multi-language UI localization.

---

## 2. Target users

| Persona | Need | Demo value |
|--------|------|------------|
| Intermediate English learner | Practice speaking words/idioms with feedback | Core live demo |
| Exhibition judge / audience | Understand the product quickly | Clear UI + live score |
| Student presenter | Show NLP + speech + gamification | Full feature tour |

---

## 3. Success criteria (demo)

A successful show build must:

1. Let a user search a word or idiom and see definition + example.
2. Let a user speak into the mic and receive an accuracy percentage.
3. Complete at least one Easy game and earn points.
4. Browse idioms by category.
5. Play Medium and Hard modes at least once each.
6. Unlock and display at least one badge after meeting a rule.
7. Survive a 2–5 minute live walkthrough without blocking errors.

---

## 4. Core features

### 4.1 Word / idiom search + definition

**Description:** Users search any supported vocabulary word or idiom and see meaning, example usage, and (when available) audio reference.

**Requirements:**

- Search input accepts word or idiom phrases.
- Results show:
  - Term
  - Definition
  - Example sentence
  - Optional phonetic hint / audio play
- Empty and “not found” states are handled with clear messaging.
- From a result, user can navigate to **Practice speaking** or related games.

**Acceptance (demo):**

- Searching a seeded term returns definition + example within the UI.
- At least ~20–30 words and ~30 idioms are searchable from local/demo content.

---

### 4.2 Real-time pronunciation checker (mic → accuracy %)

**Description:** Users practice speaking a target word or sentence. The system analyzes speech and returns an accuracy percentage with short feedback.

**Requirements:**

- Microphone permission prompt and recording controls (start / stop).
- Display target text clearly before speaking.
- After recording, show:
  - Overall accuracy (0–100%)
  - Short feedback (e.g. “Great match” / “Try again — listen to the reference”)
  - Optional transcript of what was heard
- Award points when score meets a threshold (e.g. ≥ 80%).
- Graceful error handling for mic denied / no audio / API failure.

**Acceptance (demo):**

- Live mic capture works in Chrome (or primary demo browser).
- A spoken attempt produces a visible accuracy percentage.
- Backup path allowed for show reliability (e.g. pre-recorded sample or mock score if API unavailable).

**Show-level scoring approach:**

- Preferred simple path: speech-to-text → compare transcript to target → similarity %.
- Optional upgrade: cloud pronunciation assessment API.
- Phoneme-level highlighting is nice-to-have, not required for MVP show.

---

### 4.3 Idiom categories

**Description:** A curated idiom library grouped by topic for browsing and practice entry points.

**Requirements:**

- Categories include at least:
  - Business
  - Daily Life
  - Emotions
  - (Optional) additional categories if content allows
- Category list page and category detail list.
- Idiom detail includes definition, example sentence, and link to speak / play games.
- Audio guide optional but recommended for demo polish.

**Acceptance (demo):**

- User can open categories, pick an idiom, and see full detail.
- Minimum ~30 idioms across 3–5 categories.

---

### 4.4 Gamified practice modules

Games reinforce learning across three difficulty levels. Completing items awards points.

#### 4.4.1 Easy — Matching / MCQ + points

**Requirements:**

- Multiple-choice quizzes and/or matching words/idioms to definitions.
- Immediate correct / incorrect feedback.
- Points awarded per correct answer (default **+10**).
- Progress within a short session (e.g. 5–10 questions).

**Acceptance (demo):**

- User finishes one Easy round and sees points increase.

#### 4.4.2 Medium — Sentence completion / listening

**Requirements:**

- Fill-in-the-blank sentence completion **or** audio-based listening challenge.
- Points awarded per correct answer (default **+20**).
- Clear retry or next-question flow.

**Acceptance (demo):**

- At least one Medium challenge type is playable end-to-end.

#### 4.4.3 Hard — Timed speaking drills

**Requirements:**

- Prompt shows target phrase; user must speak within a time limit.
- Uses pronunciation scoring from §4.2.
- Points awarded when score ≥ threshold (default **+30** at ≥ 80%).
- Show timer and pass/fail result.

**Acceptance (demo):**

- One Hard round completes with timer + score + points update.

---

### 4.5 Badge system

**Description:** Badges unlock when users hit milestones, visible on a badges / profile-style screen.

**Suggested starter badges:**

| Badge | Unlock rule |
|-------|-------------|
| First Word | Complete first search or first speak attempt |
| Perfect Score | Achieve 100% (or ≥ 95%) on a speak attempt |
| Easy Starter | Finish one Easy game round |
| Game Runner | Complete 5 games (any difficulty) |
| Hard Mode Champion | Pass one Hard speaking drill |
| Point Collector | Reach a point threshold (e.g. 100 pts) |

**Requirements:**

- Badge locked / unlocked visual states.
- Unlock toast or modal when earned.
- Persist badges for the demo session (localStorage acceptable).

**Acceptance (demo):**

- Completing a defined action unlocks a badge and shows it in the UI.

---

## 5. Key system workflow

```text
1. Input
   User searches a word/idiom OR receives a game/speak challenge prompt.

2. Processing
   - Retrieve definition and contextual example from content store / API.
   - Capture microphone audio (for speak / Hard mode).
   - Run speech-to-text or pronunciation assessment.
   - Compare against target text / reference.
   - Update points and evaluate badge rules.

3. Output
   - Definition and examples
   - Accuracy percentage + short feedback
   - Game result (correct/incorrect)
   - Updated points and newly unlocked badges
```

---

## 6. Information architecture (screens)

| Screen | Purpose |
|--------|---------|
| Home / Dashboard | Entry, points summary, CTAs to Search / Idioms / Games / Badges |
| Search | Word/idiom lookup + definition |
| Practice | Mic recording + accuracy result |
| Idiom categories | Browse by topic |
| Idiom detail | Definition, example, practice links |
| Games hub | Easy / Medium / Hard entry |
| Easy game | Matching / MCQ |
| Medium game | Cloze / listening |
| Hard game | Timed speaking |
| Badges | Collection of locked/unlocked badges |

---

## 7. Scoring & progression rules

| Action | Points |
|--------|--------|
| Easy correct answer | +10 |
| Medium correct answer | +20 |
| Hard speak pass (≥ 80%) | +30 |
| Optional speak practice (≥ 80%) outside Hard | +15 (optional) |

**Persistence (show):** `localStorage` for points, badges, and optional progress is sufficient. No real auth required.

---

## 8. Content minimum (demo dataset)

| Content type | Minimum |
|--------------|---------|
| Vocabulary words | 20–30 |
| Idioms | ~30 across 3–5 categories |
| Easy questions | ~10 |
| Medium challenges | ~5 |
| Hard speaking prompts | ~5 |
| Badges | 4–6 |

Content may live in static JSON for the show build.

---

## 9. Technical requirements

### 9.1 Recommended stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS (+ optional shadcn/ui) |
| Client state | React state and/or Zustand |
| Content | JSON files; optional SQLite/Prisma later |
| Speech | Whisper API or Web Speech API; optional Azure Pronunciation Assessment |
| Definitions | Local JSON and/or Free Dictionary API |
| Persistence | localStorage |
| Deploy (optional) | Vercel |

### 9.2 Architecture notes

- Microphone and recording run in **client components**.
- Scoring and definition lookup may use **Next.js Route Handlers** (`app/api/...`).
- Prefer a single Next.js app for the exhibition (no separate backend required).

### 9.3 Suggested project shape

```text
app/
  page.tsx
  search/page.tsx
  idioms/page.tsx
  practice/page.tsx
  games/easy/page.tsx
  games/medium/page.tsx
  games/hard/page.tsx
  badges/page.tsx
  api/define/route.ts
  api/score/route.ts
  api/content/route.ts
data/
  words.json
  idioms.json
  games.json
  badges.json
lib/
  scoring.ts
  points.ts
  badges.ts
```

### 9.4 Browser / device

- Primary demo target: desktop Chrome with working microphone.
- Responsive layout preferred but desktop-first is acceptable for show.

---

## 10. Build phases

1. **Foundation** — Next.js + Tailwind + layout + seed JSON  
2. **Search + definition**  
3. **Idiom categories + detail**  
4. **Points store**  
5. **Easy game**  
6. **Mic + accuracy scoring**  
7. **Medium game**  
8. **Hard game (timed speak)**  
9. **Badge unlock + badges screen**  
10. **Presentation polish** (copy, empty states, backup demo path)

---

## 11. Risks & mitigations (show)

| Risk | Mitigation |
|------|------------|
| Mic / speech API fails on venue Wi‑Fi | Offline/mock scoring path; pre-recorded demo clip |
| Sparse content looks empty | Seed enough JSON before show day |
| Scope creep delays demo | Ship phases 1–6 first; Medium/Hard/Badges next |
| Scoring feels unfair | Show similarity % + friendly copy; avoid overclaiming “native phoneme AI” |

---

## 12. Value proposition (for presentation)

Unlike a static dictionary, Idiomify connects **meaning → speaking → feedback → reward**. Instant accuracy feedback plus Easy/Medium/Hard games and badges keep the demo interactive and memorable for a project exhibition.

---

## 13. Open decisions

- Exact speech provider (Whisper vs Web Speech vs Azure).
- Matching vs MCQ as the primary Easy mode (or both).
- Whether Medium focuses on cloze, listening, or both.
- Whether guest profile name is shown on Home / Badges.

---

## 14. Approval

| Role | Name | Date | Sign-off |
|------|------|------|----------|
| Product owner | | | |
| Developer | | | |
| Presenter | | | |
