/** Test types that have a leaderboard */
export const LEADERBOARD_MODES = ["time 15", "time 30", "time 60", "words 25"] as const
export type LeaderboardMode = (typeof LEADERBOARD_MODES)[number]

export interface ScoreRecord {
  id: string
  username: string
  wpm: number
  accuracy: number
  mode: LeaderboardMode
  createdAt: string
}

export interface RankedScore extends ScoreRecord {
  rank: number
}
