import { LEADERBOARD_MODES, type LeaderboardMode, type RankedScore, type ScoreRecord } from "@/models"

/*
 * The leaderboard, kept in this browser: a field of seeded demo players plus the scores you submit,
 * which are saved in localStorage. It works the same on any static host, with no server.
 */

const PLAYERS = [
  "keymaster", "swiftfingers", "qwertyqueen", "homerow_hero", "clackattack", "typhoon", "nimblenina",
  "capslock", "spacebarista", "tabby", "ctrl_alt_elite", "lettersmith", "rapid.ruth", "wordsworth", "slowpoke",
]

const DAY = 24 * 60 * 60 * 1000

// Deterministic pseudo-random numbers, so the demo board is the same on every start
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return seed / 2147483647
}

const seed = (): ScoreRecord[] => {
  const rand = seeded(42)
  return LEADERBOARD_MODES.flatMap((mode, m) =>
    PLAYERS.map((username, i) => {
      // Shorter tests run a little faster; better players sit higher
      const base = 148 - i * 7.5 - m * 3
      return {
        id: `seed-${m}-${i}`,
        username,
        wpm: Math.round((base + rand() * 6) * 100) / 100,
        accuracy: Math.round((99.4 - i * 0.35 - rand() * 1.2) * 100) / 100,
        mode,
        createdAt: new Date(Date.now() - Math.floor(rand() * 30) * DAY - rand() * DAY).toISOString(),
      }
    })
  )
}

// Kept on globalThis so dev hot reloads don't wipe submitted scores (versioned, so a
// new data shape reseeds instead of reading the old one)

const KEY = "typify:scores"

/** Scores submitted in this browser */
const saved = (): ScoreRecord[] => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]")
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

const all = () => [...seed(), ...saved()]

const byRank = (a: ScoreRecord, b: ScoreRecord) =>
  b.wpm - a.wpm || b.accuracy - a.accuracy || a.createdAt.localeCompare(b.createdAt)

/** Each player's best score for a mode, ranked */
const board = (mode: LeaderboardMode): RankedScore[] => {
  const best = new Map<string, ScoreRecord>()
  for (const s of all()) {
    if (s.mode !== mode) continue
    const key = s.username.toLowerCase()
    const current = best.get(key)
    if (!current || byRank(s, current) < 0) best.set(key, s)
  }
  return [...best.values()].sort(byRank).map((s, i) => ({ ...s, rank: i + 1 }))
}

export const topScores = (mode: LeaderboardMode, limit = 50) => board(mode).slice(0, limit)

export type Submitted = { score: ScoreRecord; rank: number; personalBest: boolean; total: number }

/** Checks and saves a result; returns its rank, or an error to show */
export const submitScore = (input: { username: string; wpm: number; accuracy: number; mode: string }): Submitted | { error: string } => {
  const username = input.username.trim()
  if (!/^[\w.-]{2,20}$/.test(username)) return { error: "Name must be 2–20 letters, digits, dots, dashes or underscores" }
  if (!LEADERBOARD_MODES.includes(input.mode as LeaderboardMode)) return { error: `Mode must be one of: ${LEADERBOARD_MODES.join(", ")}` }
  // Anything above 300 wpm is almost certainly not a person typing
  if (!(input.wpm > 0 && input.wpm <= 300)) return { error: "wpm must be between 0 and 300" }
  if (!(input.accuracy >= 0 && input.accuracy <= 100)) return { error: "Accuracy must be between 0 and 100" }

  const mode = input.mode as LeaderboardMode
  const score: ScoreRecord = {
    id: crypto.randomUUID(),
    username,
    wpm: Math.round(input.wpm * 100) / 100,
    accuracy: Math.round(input.accuracy * 100) / 100,
    mode,
    createdAt: new Date().toISOString(),
  }
  try {
    localStorage.setItem(KEY, JSON.stringify([...saved(), score]))
  } catch {
    return { error: "Couldn’t save your score in this browser" }
  }
  const ranked = board(mode)
  const mine = ranked.find(s => s.username.toLowerCase() === username.toLowerCase())!
  return { score, rank: mine.rank, personalBest: mine.id === score.id, total: ranked.length }
}
