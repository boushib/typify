# Typify

Typify measures your typing speed and accuracy. It's built with **Next.js 16** (App Router), **React 19** and **TypeScript**.

Settings, results and personal bests are saved in your browser. The leaderboard is served by a mock API (a Next.js route handler with in-memory demo data), so it works with no external services.

## Features

### Typing test
- **Modes:** time (15, 30, 60, 120 s), words (10, 25, 50, 100) and quote, with optional punctuation and numbers
- A smooth caret (line, block or underline), letter-by-letter coloring, mistyped words underlined, and three visible lines that scroll as you type
- Backspace into a word with a mistake, <kbd>Ctrl</kbd>+<kbd>Backspace</kbd> to delete a word, <kbd>Tab</kbd> to restart
- Live countdown (or word count) and live WPM, plus a Caps Lock warning
- Works with phone keyboards: input goes through a hidden text field

### Results
- WPM, accuracy, raw WPM, consistency, a character breakdown (correct, incorrect, extra, missed) and test length
- A chart of WPM and raw speed per second, with markers where mistakes happened
- A "new personal best" badge
- Results under 1 second or over 350 WPM are marked invalid and not saved

### Leaderboard
- Boards for time 15, 30 and 60, and words 25, showing each typist's best result
- A podium for the top three, with gold, silver and bronze trophies; the ranked list follows below
- Submit a result from the results screen and see your rank; your rows are highlighted

### Stats
- Tests completed, time spent typing, highest WPM, and recent average WPM and accuracy
- A progress chart with a 10-test moving average
- Personal bests for every time and word count, plus a table of recent tests

### Letter Rush (arcade)
- The original Typify game: type the letter shown, as many as you can in 30 seconds
- A combo multiplier (up to x5), a shake on misses, floating points, a next-letter preview and a saved best score

### Settings
- **Themes:** eight color themes (Midnight, Paper, Ocean, Forest, Sunset, Latte, Mono, Matrix), applied before first paint so the page never flashes the wrong colors
- Caret style, smooth caret, key click sounds (synthesized, no audio files), live WPM, font size and your leaderboard name

The app also works on phones, and respects the OS "reduce motion" setting.

## Getting started

Requires Node.js 20.9+ and pnpm.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script | What it does |
| --- | --- |
| `pnpm dev` | Dev server with Turbopack |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm lint` | ESLint (flat config) |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm dev:agent` / `pnpm build:agent` | The same on port 3400, with a separate `.next-agent` output, so a second server doesn't clash with yours |

## API

The leaderboard API is a mock: scores live in memory, seeded with demo players, and reset when the server restarts. To make it real, swap `src/lib/server/scores.ts` for a database.

### `GET /api/scores?mode=time%2015&limit=50`

Each player's best score for a mode, ranked. `mode` is one of `time 15`, `time 30`, `time 60` or `words 25`.

```json
[{ "id": "…", "username": "keymaster", "wpm": 148, "accuracy": 98.77, "mode": "time 15", "createdAt": "…", "rank": 1 }]
```

### `POST /api/scores`

```json
{ "username": "you", "wpm": 112.4, "accuracy": 97.5, "mode": "time 15" }
```

Returns the saved score with your rank, for example `{ "score": {…}, "rank": 7, "total": 17, "personalBest": true }`.

Names must be 2–20 letters, digits, dots, dashes or underscores. Scores above 300 WPM are rejected.

## Project structure

```
src/
  app/                 Routes: / (test), /arcade, /leaderboard, /stats, /settings, /api/scores
  components/          Typing test, navbar, trophy, app shell
  views/               One folder per page
  lib/                 Test engine and stats, words, quotes, themes, sound
  lib/server/          Mock score store (server only)
  store/               Settings, results history and best scores (zustand, saved to localStorage)
```

**How WPM is calculated:** every five correctly typed characters count as one word. A word counts only if it's typed correctly, and then its trailing space counts too. **Raw WPM** counts every keystroke. **Consistency** measures how steady your per-second speed is.
