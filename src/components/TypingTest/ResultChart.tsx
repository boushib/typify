"use client"

import { useCallback, useState } from "react"
import type { Sample } from "@/lib/engine"
import styles from "./TypingTest.module.sass"

const H = 200
const PAD = { top: 12, right: 12, bottom: 28, left: 36 }

/** Chart width follows its container so the text keeps its real size */
const useWidth = () => {
  const [width, setWidth] = useState(720)
  const ref = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

const niceMax = (value: number) => {
  const raw = Math.max(10, value) / 4
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)))
  return [1, 2, 5, 10].map(m => m * magnitude).find(t => t >= raw)! * 4
}

/** WPM and raw speed per second, with markers where mistakes happened */
const ResultChart = ({ samples }: { samples: Sample[] }) => {
  const [ref, W] = useWidth()
  const [hover, setHover] = useState<number | null>(null)
  if (samples.length < 2) return <p className={styles.chartEmpty}>Type for a couple of seconds to see a chart.</p>

  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const max = niceMax(Math.max(...samples.map(s => Math.max(s.wpm, s.raw))))
  const last = samples[samples.length - 1].second
  const x = (second: number) => PAD.left + ((second - samples[0].second) / Math.max(0.1, last - samples[0].second)) * plotW
  const y = (v: number) => PAD.top + plotH * (1 - v / max)
  const line = (key: "wpm" | "raw") => samples.map((s, i) => `${i ? "L" : "M"}${x(s.second).toFixed(1)},${y(s[key]).toFixed(1)}`).join("")
  const area = `${line("wpm")}L${x(last)},${PAD.top + plotH}L${x(samples[0].second)},${PAD.top + plotH}Z`
  const labelEvery = Math.ceil(samples.length / Math.max(4, Math.floor(plotW / 50)))
  const hovered = hover !== null ? samples[hover] : null

  return (
    <div ref={ref} className={styles.chart}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Words per minute over the test">
        <defs>
          <linearGradient id="wpmFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--main)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--main)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <g key={f}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(max * f)} y2={y(max * f)} className={styles.gridLine} />
            <text x={PAD.left - 8} y={y(max * f) + 4} textAnchor="end" className={styles.axis}>
              {Math.round(max * f)}
            </text>
          </g>
        ))}
        {samples.map((s, i) =>
          i % labelEvery === 0 || i === samples.length - 1 ? (
            <text key={s.second} x={x(s.second)} y={H - 8} textAnchor="middle" className={styles.axis}>
              {Math.round(s.second)}
            </text>
          ) : null
        )}
        <path d={area} fill="url(#wpmFill)" className={styles.chartArea} />
        <path d={line("raw")} pathLength={1} className={styles.rawLine} />
        <path d={line("wpm")} pathLength={1} className={styles.wpmLine} />
        {samples.map(s =>
          s.errors > 0 ? (
            <g key={`e${s.second}`} className={styles.errorMark} transform={`translate(${x(s.second)}, ${y(s.raw)})`}>
              <path d={`M-3,-3L3,3M3,-3L-3,3`} />
              <title>{`${s.errors} ${s.errors === 1 ? "error" : "errors"}`}</title>
            </g>
          ) : null
        )}
        {hovered && <line x1={x(hovered.second)} x2={x(hovered.second)} y1={PAD.top} y2={PAD.top + plotH} className={styles.hoverLine} />}
        {samples.map((s, i) => (
          <rect
            key={`h${s.second}`}
            x={x(s.second) - plotW / samples.length / 2}
            y={PAD.top}
            width={plotW / samples.length}
            height={plotH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      {hovered && (
        <div className={styles.tooltip} style={{ left: `${(x(hovered.second) / W) * 100}%` }}>
          <strong>{Math.round(hovered.second)}s</strong>
          <span>wpm {hovered.wpm}</span>
          <span>raw {hovered.raw}</span>
          {hovered.errors > 0 && <span className={styles.tooltipError}>errors {hovered.errors}</span>}
        </div>
      )}
      <div className={styles.legend}>
        <span className={styles.legendWpm}>wpm</span>
        <span className={styles.legendRaw}>raw</span>
        <span className={styles.legendErrors}>errors</span>
      </div>
    </div>
  )
}

export default ResultChart
