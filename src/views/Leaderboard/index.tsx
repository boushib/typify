"use client"

import classNames from "classnames"
import { Crown, RefreshCw, Sparkle } from "lucide-react"
import { useEffect, useState } from "react"
import Trophy, { type Medal } from "@/components/Trophy"
import { LEADERBOARD_MODES, type LeaderboardMode, type RankedScore } from "@/models"
import { useStore } from "@/store"
import styles from "./Leaderboard.module.sass"

const MEDALS: Medal[] = ["gold", "silver", "bronze"]

/** Initials on a color picked from the name, so each player keeps theirs */
export const PlayerAvatar = ({ name, size = 40 }: { name: string; size?: number }) => {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 360
  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, hsl(${hash} 70% 62%), hsl(${(hash + 40) % 360} 65% 45%))` }}
      aria-hidden
    >
      {name.replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase()}
    </span>
  )
}

const ago = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  return days <= 0 ? "today" : days === 1 ? "yesterday" : days < 30 ? `${days} days ago` : new Date(iso).toLocaleDateString()
}

const PodiumSpot = ({ score, place, you }: { score: RankedScore; place: 1 | 2 | 3; you: boolean }) => (
  <div className={classNames(styles.spot, styles[`spot${place}`])}>
    <div className={styles.spotTop}>
      {place === 1 && <Crown className={styles.crown} size={28} />}
      <div className={styles.trophyWrap}>
        {place === 1 && (
          <>
            <Sparkle className={classNames(styles.sparkle, styles.sparkleA)} size={14} />
            <Sparkle className={classNames(styles.sparkle, styles.sparkleB)} size={10} />
            <Sparkle className={classNames(styles.sparkle, styles.sparkleC)} size={12} />
          </>
        )}
        <Trophy medal={MEDALS[place - 1]} size={place === 1 ? 92 : 70} className={styles.trophy} />
      </div>
      <PlayerAvatar name={score.username} size={place === 1 ? 56 : 46} />
      <div className={styles.spotName}>
        {score.username}
        {you && <span className={styles.youTag}>you</span>}
      </div>
      <div className={styles.spotWpm}>
        {Math.round(score.wpm)}
        <small>wpm</small>
      </div>
      <div className={styles.spotAcc}>{score.accuracy.toFixed(1)}% acc</div>
    </div>
    <div className={styles.pedestal}>
      <span>{place}</span>
    </div>
  </div>
)

type Load = { mode: LeaderboardMode; scores: RankedScore[] | null; error: string | null }

const Leaderboard = () => {
  const username = useStore(s => s.settings.username).toLowerCase()
  const [mode, setMode] = useState<LeaderboardMode>("time 15")
  const [attempt, setAttempt] = useState(0)
  const [load, setLoad] = useState<Load | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/scores?mode=${encodeURIComponent(mode)}&limit=50`)
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((scores: RankedScore[]) => !cancelled && setLoad({ mode, scores, error: null }))
      .catch(() => !cancelled && setLoad({ mode, scores: null, error: "Couldn’t load the leaderboard." }))
    return () => {
      cancelled = true
    }
  }, [mode, attempt])

  const ready = load?.mode === mode ? load : null
  const scores = ready?.scores ?? []
  const [first, second, third] = scores
  const rest = scores.slice(3)

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <div>
          <h1>Leaderboard</h1>
          <p>Each typist’s best result. Finish a test to claim your spot.</p>
        </div>
        <div className={styles.tabs} role="tablist" aria-label="Test type">
          {LEADERBOARD_MODES.map(m => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={m === mode}
              className={classNames(styles.tab, m === mode && styles.tabActive)}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </header>

      {!ready && (
        <div className={styles.skeleton} aria-busy>
          {[2, 1, 3].map(p => (
            <div key={p} className={styles[`skeleton${p}`]} />
          ))}
        </div>
      )}

      {ready?.error && (
        <div className={styles.state}>
          <p>{ready.error}</p>
          <button type="button" className={styles.retry} onClick={() => setAttempt(a => a + 1)}>
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      )}

      {ready && !ready.error && scores.length === 0 && <div className={styles.state}>No scores yet. Be the first!</div>}

      {first && (
        <section className={styles.podium} key={mode} aria-label="Top three">
          {second && <PodiumSpot score={second} place={2} you={second.username.toLowerCase() === username} />}
          <PodiumSpot score={first} place={1} you={first.username.toLowerCase() === username} />
          {third && <PodiumSpot score={third} place={3} you={third.username.toLowerCase() === username} />}
        </section>
      )}

      {rest.length > 0 && (
        <ol className={styles.list} key={`list-${mode}`} start={4}>
          <li className={styles.listHead} aria-hidden>
            <span>#</span>
            <span>name</span>
            <span>wpm</span>
            <span>accuracy</span>
            <span>date</span>
          </li>
          {rest.map((s, i) => (
            <li
              key={s.id}
              className={classNames(styles.row, s.username.toLowerCase() === username && styles.rowYou)}
              style={{ animationDelay: `${600 + i * 35}ms` }}
            >
              <span className={styles.rank}>{s.rank}</span>
              <span className={styles.name}>
                <PlayerAvatar name={s.username} size={30} />
                {s.username}
                {s.username.toLowerCase() === username && <span className={styles.youTag}>you</span>}
              </span>
              <span className={styles.wpm}>{s.wpm.toFixed(2)}</span>
              <span>{s.accuracy.toFixed(2)}%</span>
              <span className={styles.date}>{ago(s.createdAt)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export default Leaderboard
