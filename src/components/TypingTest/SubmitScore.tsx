"use client"

import { Check, Crown, Send } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import type { Result } from "@/lib/engine"
import { submitScore } from "@/lib/scores"
import { LEADERBOARD_MODES, type LeaderboardMode } from "@/models"
import { useStore } from "@/store"
import styles from "./TypingTest.module.sass"

type Submitted = { rank: number; total: number; personalBest: boolean }

/** Adds a result to the leaderboard; only for test types that have a board */
const SubmitScore = ({ result }: { result: Result }) => {
  const saved = useStore(s => s.settings.username)
  const setSettings = useStore(s => s.setSettings)
  const [name, setName] = useState(saved)
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle")
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState<Submitted | null>(null)

  const mode = result.label as LeaderboardMode
  if (!LEADERBOARD_MODES.includes(mode)) return null

  const submit = () => {
    const res = submitScore({ username: name, wpm: result.wpm, accuracy: result.accuracy, mode })
    if ("error" in res) {
      setError(res.error)
      setStatus("error")
      return
    }
    setSettings({ username: name.trim() })
    setSubmitted(res)
    setStatus("idle")
  }

  if (submitted) {
    return (
      <div className={styles.submitDone}>
        <Crown size={18} />
        <span>
          {submitted.personalBest ? "You’re" : "Your best is still"} <strong>#{submitted.rank}</strong> of {submitted.total} on {mode}
        </span>
        <Link href="/leaderboard" className={styles.submitLink}>
          View leaderboard
        </Link>
      </div>
    )
  }

  return (
    <form
      className={styles.submit}
      onSubmit={e => {
        e.preventDefault()
        submit()
      }}
      // Keep Tab/Enter shortcuts on the results screen from firing while typing a name
      onKeyDown={e => e.stopPropagation()}
    >
      <label className={styles.submitLabel} htmlFor="leaderboard-name">
        <Crown size={16} /> Submit to the {mode} leaderboard
      </label>
      <div className={styles.submitRow}>
        <input
          id="leaderboard-name"
          value={name}
          maxLength={20}
          placeholder="your name"
          autoComplete="nickname"
          onChange={e => setName(e.target.value)}
        />
        <button type="submit" className={styles.submitButton} disabled={status === "sending" || name.trim().length < 2}>
          {status === "sending" ? <Check size={16} /> : <Send size={16} />} {status === "sending" ? "Sending…" : "Submit"}
        </button>
      </div>
      {status === "error" && <p className={styles.submitError}>{error}</p>}
    </form>
  )
}

export default SubmitScore
