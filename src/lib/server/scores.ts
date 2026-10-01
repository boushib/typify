import "server-only"
import { LEADERBOARD_MODES, type LeaderboardMode, type RankedScore, type ScoreRecord } from "@/models"

/*
 * Mock score store for the leaderboard API. It lives in memory, seeded with
 * demo players, so submitted scores reset when the server restarts. Swap this
 * module for a database when the app gets a real backend.
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
const store = globalThis as typeof globalThis & { __typifyScoresV2?: ScoreRecord[] }
store.__typifyScoresV2 ??= seed()

const byRank = (a: ScoreRecord, b: ScoreRecord) =>
  b.wpm - a.wpm || b.accuracy - a.accuracy || a.createdAt.localeCompare(b.createdAt)

/** Each player's best score for a mode, ranked */
const board = (mode: LeaderboardMode): RankedScore[] => {
  const best = new Map<string, ScoreRecord>()
  for (const s of store.__typifyScoresV2!) {
    if (s.mode !== mode) continue
    const key = s.username.toLowerCase()
    const current = best.get(key)
    if (!current || byRank(s, current) < 0) best.set(key, s)
  }
  return [...best.values()].sort(byRank).map((s, i) => ({ ...s, rank: i + 1 }))
}

export const topScores = (mode: LeaderboardMode, limit = 50) => board(mode).slice(0, limit)

export const addScore = (input: Omit<ScoreRecord, "id" | "createdAt">) => {
  const record: ScoreRecord = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  store.__typifyScoresV2!.push(record)
  const ranked = board(input.mode)
  const mine = ranked.find(s => s.username.toLowerCase() === input.username.toLowerCase())!
  return { score: record, rank: mine.rank, personalBest: mine.id === record.id, total: ranked.length }
}
