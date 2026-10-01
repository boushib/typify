import "server-only"
import type { ScoreRecord } from "@/models"

/*
 * Mock score store for the leaderboard API. It lives in memory, seeded with
 * demo players, so scores reset when the server restarts. Swap this module
 * for a database when the app gets a real backend.
 */

const SEED: [string, number][] = [
  ["keymaster", 92],
  ["swiftfingers", 88],
  ["qwertyqueen", 85],
  ["homerow_hero", 81],
  ["clackattack", 77],
  ["typhoon", 74],
  ["nimblenina", 70],
  ["capslock", 66],
  ["spacebarista", 61],
  ["slowpoke", 48],
]

const DAY = 24 * 60 * 60 * 1000

// Kept on globalThis so dev hot reloads don't wipe submitted scores
const store = globalThis as typeof globalThis & { __typifyScores?: ScoreRecord[] }
store.__typifyScores ??= SEED.map(([username, score], i) => ({
  id: `seed-${i + 1}`,
  username,
  score,
  createdAt: new Date(Date.now() - (i + 1) * DAY).toISOString(),
}))

const scores = () => store.__typifyScores!

export const topScores = (limit = 50) =>
  [...scores()].sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt)).slice(0, limit)

export const addScore = (username: string, score: number): ScoreRecord => {
  const record: ScoreRecord = { id: crypto.randomUUID(), username, score, createdAt: new Date().toISOString() }
  scores().push(record)
  return record
}
