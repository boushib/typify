"use client"

import { Keyboard, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { TIME_OPTIONS, WORD_OPTIONS } from "@/lib/engine"
import { personalBest, useStore } from "@/store"
import ProgressChart from "./ProgressChart"
import styles from "./Stats.module.sass"

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.round(seconds % 60)
  return h ? `${h}h ${m}m` : m ? `${m}m ${s}s` : `${s}s`
}

const PB_GROUPS = [
  { title: "time", labels: TIME_OPTIONS.map(t => `time ${t}`), short: (l: string) => l.replace("time ", "") + "s" },
  { title: "words", labels: WORD_OPTIONS.map(w => `words ${w}`), short: (l: string) => l.replace("words ", "") },
]

const StatsView = () => {
  const history = useStore(s => s.history)
  const clearHistory = useStore(s => s.clearHistory)
  const [confirming, setConfirming] = useState(false)
  const [shown, setShown] = useState(15)

  if (!history.length) {
    return (
      <div className={`container ${styles.empty}`}>
        <Keyboard size={40} />
        <h1>No tests yet</h1>
        <p>Your speed, accuracy and personal bests show up here after your first test.</p>
        <Link href="/" className={styles.cta}>
          Take a test
        </Link>
      </div>
    )
  }

  const total = history.reduce((s, r) => s + r.duration, 0)
  const best = Math.max(...history.map(r => r.wpm))
  const recent = history.slice(0, 10)
  const avg = recent.reduce((s, r) => s + r.wpm, 0) / recent.length
  const acc = recent.reduce((s, r) => s + r.accuracy, 0) / recent.length

  const cards = [
    { label: "tests completed", value: history.length.toLocaleString() },
    { label: "time typing", value: formatDuration(total) },
    { label: "highest wpm", value: Math.round(best) },
    { label: "average wpm (last 10)", value: Math.round(avg) },
    { label: "accuracy (last 10)", value: `${acc.toFixed(1)}%` },
  ]

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1>Your stats</h1>
        {confirming ? (
          <div className={styles.confirm}>
            <span>Delete all {history.length} results?</span>
            <button type="button" className={styles.danger} onClick={() => {
                clearHistory()
                setConfirming(false)
              }}>
              Delete
            </button>
            <button type="button" className={styles.ghost} onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className={styles.ghost} onClick={() => setConfirming(true)}>
            <Trash2 size={14} /> Clear history
          </button>
        )}
      </header>

      <div className={styles.cards}>
        {cards.map(c => (
          <div key={c.label} className={styles.card}>
            <span>{c.label}</span>
            <strong>{c.value}</strong>
          </div>
        ))}
      </div>

      <section className={styles.panel}>
        <h2>Progress</h2>
        <ProgressChart results={history.slice(0, 100)} />
      </section>

      <section className={styles.panel}>
        <h2>Personal bests</h2>
        <div className={styles.pbGroups}>
          {PB_GROUPS.map(group => (
            <div key={group.title} className={styles.pbGroup}>
              {group.labels.map(label => {
                const pb = personalBest(history, label)
                return (
                  <div key={label} className={styles.pb}>
                    <span className={styles.pbMode}>
                      {group.title} {group.short(label)}
                    </span>
                    <strong>{pb ? Math.round(pb.wpm) : "–"}</strong>
                    <span className={styles.pbAcc}>{pb ? `${Math.round(pb.accuracy)}% acc` : "no result"}</span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Recent tests</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>wpm</th>
                <th>raw</th>
                <th>accuracy</th>
                <th>consistency</th>
                <th title="correct / incorrect / extra / missed">chars</th>
                <th>test</th>
                <th>date</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, shown).map(r => (
                <tr key={r.id}>
                  <td className={styles.wpm}>{r.wpm.toFixed(2)}</td>
                  <td>{r.raw.toFixed(2)}</td>
                  <td>{r.accuracy.toFixed(2)}%</td>
                  <td>{r.consistency}%</td>
                  <td>
                    {r.chars.correct}/{r.chars.incorrect}/{r.chars.extra}/{r.chars.missed}
                  </td>
                  <td>{r.label}</td>
                  <td className={styles.date}>{new Date(r.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {shown < history.length && (
          <button type="button" className={styles.more} onClick={() => setShown(n => n + 25)}>
            Show more
          </button>
        )}
      </section>
    </div>
  )
}

export default StatsView
