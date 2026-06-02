# English Explorers

A mobile-first React vocabulary game for 9-year-olds. Match pictures to English words, earn points, and climb the **Top English Explorers** leaderboard.

**Stack:** Vite · React · Tailwind CSS · Lucide · Appwrite Cloud · Vercel

## Quick start (demo mode)

Without Appwrite credentials, the app runs in **demo mode** using local storage and built-in sample puzzles.

```bash
npm install
npm run dev
```

Open http://localhost:5173 — sign up with any email/password (8+ chars), then play.

## How to set up Appwrite

### 1. Create a project

1. Go to [cloud.appwrite.io](https://cloud.appwrite.io) and create a project.
2. Copy **Project ID** and set endpoint to `https://cloud.appwrite.io/v1`.
3. Under **Auth**, enable **Email/Password**.
4. Under **Platforms**, add a Web app:
   - `http://localhost:5173`
   - Your Vercel URL (e.g. `https://your-app.vercel.app`)

### 2. Create a database

Create a database and note the **Database ID**.

### 3. Create collections

#### `profiles`

| Attribute      | Type    | Required | Default |
|----------------|---------|----------|---------|
| user_id        | string  | yes      | —       |
| username       | string  | yes      | —       |
| total_points   | integer | yes      | 0       |
| avatar_url     | string  | no       | —       |

**Collection permissions:** Read = Any. **Create** = Users (required so signup can insert a profile). Update/Delete = Users (optional; document-level `write` is set by the app).

On each new profile document the app sets: `read(any)` + `write(user:{id})`.

#### `vocabulary_puzzles`

| Attribute    | Type     | Required |
|--------------|----------|----------|
| word         | string   | yes      |
| translation  | string   | yes      |
| options      | string[] | yes      |
| category     | string   | yes      |
| image_url    | string   | no       |

**Collection permissions:** Read = Users. Create/Update/Delete = Admin only (seed via Console).

#### `user_progress`

| Attribute   | Type    | Required |
|-------------|---------|----------|
| user_id     | string  | yes      |
| puzzle_id   | string  | yes      |
| is_correct  | boolean | yes      |

**Collection permissions:** Create/Read/Update/Delete = Users (per-document permissions from the app).

### 4. Seed puzzles

Appwrite Console import expects **CSV**, not JSON. Use [`scripts/puzzle-bank-import.csv`](scripts/puzzle-bank-import.csv) (270+ words from `puzzleBank.js`, at least 30 per level category).

**CSV import (Console):**

1. Open your database → `vocabulary_puzzles` collection.
2. Click **Import** (or bulk import / CSV).
3. Upload `scripts/puzzle-bank-import.csv` (not `.json` or `.js`). Run `npm run export:csv` to regenerate.
4. First row must be exactly: `word,translation,options,category,image_url` (no extra spaces, **no UTF-8 BOM** — do not re-save via Excel with BOM).
5. If import still fails, open the CSV in Notepad and confirm line 1 starts with `word`, not `﻿word`.
6. Map columns to your attributes (`options` must be a **string array** in the collection).

If import still fails on `options`, add documents manually or use the seed script below.

**Seed script (recommended for Hebrew + arrays):**

1. In Appwrite Console → **API Keys** → create a key with `databases.write` scope.
2. Add to `.env`:
   ```env
   APPWRITE_API_KEY=your_server_api_key
   ```
3. Run:
   ```bash
   node scripts/seed-appwrite.mjs
   ```

Source data lives in [`src/data/puzzleBank.js`](src/data/puzzleBank.js), which is assembled from [`src/data/vocabulary/categories.js`](src/data/vocabulary/categories.js).

### 5. Environment variables

Copy `.env.example` to `.env` and fill in:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_PROFILES_COLLECTION_ID=profiles_collection_id
VITE_APPWRITE_PUZZLES_COLLECTION_ID=puzzles_collection_id
VITE_APPWRITE_PROGRESS_COLLECTION_ID=progress_collection_id
VITE_PEXELS_API_KEY=optional
VITE_UNSPLASH_ACCESS_KEY=optional
```

Restart the dev server after changing `.env`.

## Image APIs

**Priority order:** OpenAI (DALL·E 2) → Pexels → Unsplash → Wikipedia → Pollinations (free)

If you only see a **word** instead of a photo, the image URL failed and the old placeholder showed text. Ensure `OPENAI_API_KEY` is set on Vercel and redeploy after any `vercel.json` change (API routes must not be rewritten to `index.html`).

### OpenAI (recommended)

Add to `.env` (server-side key — **never** commit this file):

```env
OPENAI_API_KEY=sk-proj-...
```

- **Local dev:** `npm run dev` proxies `/api/generate-image` automatically.
- **Vercel:** Add `OPENAI_API_KEY` in Project → Settings → Environment Variables (not `VITE_`).

The key is only used on the server (`api/generate-image.js`, `api/speak-word.js`), so it is not exposed in the browser bundle.

### Word pronunciation (answer audio)

Each answer has a speaker button. Tapping it plays the English word via OpenAI TTS (`/api/speak-word`). If TTS is unavailable, the browser falls back to built-in speech (Web Speech API).

### Optional fallbacks

- [Pexels API](https://www.pexels.com/api/) — `VITE_PEXELS_API_KEY`
- [Unsplash API](https://unsplash.com/developers) — `VITE_UNSPLASH_ACCESS_KEY`

If OpenAI fails or is unset, the app tries Pexels/Unsplash, then placeholders.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add all `VITE_*` environment variables from `.env`.
4. Deploy — `vercel.json` handles SPA routing.

## Game rules

- **10 levels** — Animals, Food, Colors, Body, Furniture, Clothes, School, Nature, Transport, and Super Explorer (mixed).
- Each round has **8 words** with pictures (OpenAI DALL·E when `OPENAI_API_KEY` is set).
- Tap the **speaker** on any answer to hear the word spoken aloud.
- **+10 points** per correct answer; **+25 bonus** when you finish a level (60%+ correct).
- Unlock harder levels with total points (30 / 60 / 90 … up to 260 for Super Explorer).
- **OpenAI words:** if a level has few puzzles in Appwrite, the app auto-generates more via `/api/generate-puzzles`.
- Built-in **270+ word bank** (30+ per playable category) in `src/data/puzzleBank.js` for offline/demo play.
- Leaderboard shows the top 10 explorers by points.

## Project structure

```
src/
  lib/appwrite.js       # Appwrite client
  context/AuthContext.jsx
  services/imageService.js
  hooks/useGameEngine.js
  components/QuizCard.jsx, Leaderboard.jsx, ...
  pages/
scripts/seed-puzzles.json
```

## Git remote

```bash
git init
git remote add origin https://github.com/Nimrodsn/English_Game_Amit.git
git add .
git commit -m "Initial English Explorers app"
git push -u origin main
```
