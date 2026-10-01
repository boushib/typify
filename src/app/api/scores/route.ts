import type { NextRequest } from "next/server"
import { addScore, topScores } from "@/lib/server/scores"

/** GET /api/scores?limit=20 — the leaderboard, best first */
export async function GET(request: NextRequest) {
  const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 50))
  return Response.json(topScores(limit))
}

/** POST /api/scores { username, score } — submit a score */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Body must be JSON" }, { status: 400 })
  }
  const { username, score } = (body ?? {}) as { username?: unknown; score?: unknown }
  const name = typeof username === "string" ? username.trim() : ""
  if (!/^[\w.-]{1,20}$/.test(name)) {
    return Response.json({ error: "Username must be 1–20 letters, digits, dots, dashes or underscores" }, { status: 400 })
  }
  if (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > 1000) {
    return Response.json({ error: "Score must be a whole number between 0 and 1000" }, { status: 400 })
  }
  return Response.json(addScore(name, score), { status: 201 })
}
