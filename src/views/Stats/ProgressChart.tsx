"use client"

import { useCallback, useState } from "react"
import type { Result } from "@/lib/engine"
import styles from "./Stats.module.sass"

const H = 220
const PAD = { top: 14, right: 14, bottom: 26, left: 38 }

const useWidth = () => {
  const [width, setWidth] = useState(900)
  const ref = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

/** WPM of each test, oldest to newest, with a 10-test moving average */
const ProgressChart = ({ results }: { results: Result[] }) => {
  const [ref, W] = useWidth()
  const [hover, setHover] = useState<number | null>(null)
  const data = [...results].reverse()
  if (data.length < 2) return <p className={styles.muted}>Finish a few more tests to see your progress.</p>

  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const top = Math.max(...data.map(r => r.wpm))
  const max = Math.ceil(Math.max(20, top) / 20) * 20
  const x = (i: number) => PAD.left + (i / (data.length - 1)) * plotW
  const y = (v: number) => PAD.top + plotH * (1 - v / max)
  const average = data.map((_, i) => {
    const window = data.slice(Math.max(0, i - 9), i + 1)
    return window.reduce((s, r) => s + r.wpm, 0) / window.length
  })
  const avgPath = average.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("")
  const hovered = hover !== null ? data[hover] : null

  return (
    <div ref={ref} className={styles.chart}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Speed over your tests">
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <g key={f}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(max * f)} y2={y(max * f)} className={styles.gridLine} />
            <text x={PAD.left - 8} y={y(max * f) + 4} textAnchor="end" className={styles.axis}>
              {Math.round(max * f)}
            </text>
          </g>
        ))}
        <path d={avgPath} pathLength={1} className={styles.avgLine} />
        {data.map((r, i) => (
          <circle
            key={r.id}
            cx={x(i)}
            cy={y(r.wpm)}
            r={hover === i ? 6 : 4}
            className={styles.dot}
            style={{ animationDelay: `${Math.min(i * 15, 600)}ms` }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      {hovered && (
        <div className={styles.tooltip} style={{ left: `${(x(hover!) / W) * 100}%`, top: `${(y(hovered.wpm) / H) * 100}%` }}>
          <strong>{Math.round(hovered.wpm)} wpm</strong>
          <span>{hovered.accuracy.toFixed(1)}% acc</span>
          <span>{hovered.label}</span>
          <span>{new Date(hovered.createdAt).toLocaleString()}</span>
        </div>
      )}
      <div className={styles.legend}>
        <span className={styles.legendDot}>test</span>
        <span className={styles.legendAvg}>average of 10</span>
      </div>
    </div>
  )
}

export default ProgressChart
