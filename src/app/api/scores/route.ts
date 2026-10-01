import type { NextRequest } from "next/server"
import { addScore, topScores } from "@/lib/server/scores"
import { LEADERBOARD_MODES, type LeaderboardMode } from "@/models"

const isMode = (value: unknown): value is LeaderboardMode => LEADERBOARD_MODES.includes(value as LeaderboardMode)

/** GET /api/scores?mode=time%2015&limit=50 — each player's best, ranked */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const mode = params.get("mode") ?? "time 15"
  if (!isMode(mode)) return Response.json({ error: `mode must be one of: ${LEADERBOARD_MODES.join(", ")}` }, { status: 400 })
  const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 50))
  return Response.json(topScores(mode, limit))
}

/** POST /api/scores { username, wpm, accuracy, mode } — submit a result; returns its rank */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Body must be JSON" }, { status: 400 })
  }
  const { username, wpm, accuracy, mode } = (body ?? {}) as Record<string, unknown>
  const name = typeof username === "string" ? username.trim() : ""
  if (!/^[\w.-]{2,20}$/.test(name)) {
    return Response.json({ error: "Name must be 2–20 letters, digits, dots, dashes or underscores" }, { status: 400 })
  }
  if (!isMode(mode)) return Response.json({ error: `mode must be one of: ${LEADERBOARD_MODES.join(", ")}` }, { status: 400 })
  // Anything above 300 wpm is almost certainly not a person typing
  if (typeof wpm !== "number" || !(wpm > 0 && wpm <= 300)) {
    return Response.json({ error: "wpm must be a number between 0 and 300" }, { status: 400 })
  }
  if (typeof accuracy !== "number" || !(accuracy >= 0 && accuracy <= 100)) {
    return Response.json({ error: "accuracy must be between 0 and 100" }, { status: 400 })
  }
  const result = addScore({ username: name, wpm: Math.round(wpm * 100) / 100, accuracy: Math.round(accuracy * 100) / 100, mode })
  return Response.json(result, { status: 201 })
}
