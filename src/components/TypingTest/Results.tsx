"use client"

import { ChevronRight, Repeat, Trophy } from "lucide-react"
import { useEffect, useState } from "react"
import type { Result } from "@/lib/engine"
import { personalBest, useStore } from "@/store"
import ResultChart from "./ResultChart"
import styles from "./TypingTest.module.sass"

/** Counts up to the value with an ease-out, for the headline numbers */
const CountUp = ({ value, decimals = 0 }: { value: number; decimals?: number }) => {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      requestAnimationFrame(() => setShown(value))
      return
    }
    const start = performance.now()
    let frame = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 700)
      setShown(value * (1 - Math.pow(1 - t, 3)))
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return <>{shown.toFixed(decimals)}</>
}

interface Props {
  result: Result
  onNext: () => void
  onRepeat: () => void
}

const Results = ({ result, onNext, onRepeat }: Props) => {
  const history = useStore(s => s.history)
  // Best before this test, to tell whether it beat it
  const previous = personalBest(
    history.filter(r => r.id !== result.id),
    result.label
  )
  const isBest = result.wpm > 0 && (!previous || result.wpm > previous.wpm)
  const { correct, incorrect, extra, missed } = result.chars

  return (
    <div className={styles.results}>
      <div className={styles.resultsTop}>
        <div className={styles.headline}>
          <div className={styles.big}>
            <span className={styles.bigLabel}>wpm</span>
            <span className={styles.bigValue}>
              <CountUp value={result.wpm} />
            </span>
          </div>
          <div className={styles.big}>
            <span className={styles.bigLabel}>acc</span>
            <span className={styles.bigValue}>
              <CountUp value={result.accuracy} />%
            </span>
          </div>
          {isBest ? (
            <div className={styles.pb}>
              <Trophy size={16} /> New personal best!
            </div>
          ) : previous ? (
            <div className={styles.pbMuted}>Personal best: {Math.round(previous.wpm)} wpm</div>
          ) : null}
        </div>
        <ResultChart samples={result.samples} />
      </div>

      <dl className={styles.statGrid}>
        <div>
          <dt>test type</dt>
          <dd className={styles.statSmall}>{result.label}</dd>
        </div>
        <div>
          <dt>raw</dt>
          <dd>{Math.round(result.raw)}</dd>
        </div>
        <div title="correct / incorrect / extra / missed">
          <dt>characters</dt>
          <dd>
            <span className={styles.charCorrect}>{correct}</span>/<span className={styles.charIncorrect}>{incorrect}</span>/
            <span className={styles.charExtra}>{extra}</span>/<span>{missed}</span>
          </dd>
        </div>
        <div>
          <dt>consistency</dt>
          <dd>{result.consistency}%</dd>
        </div>
        <div>
          <dt>time</dt>
          <dd>{result.duration}s</dd>
        </div>
      </dl>

      {result.quote && (
        <blockquote className={styles.resultQuote}>
          “{result.quote.text}” <cite>— {result.quote.source}</cite>
        </blockquote>
      )}

      <div className={styles.resultActions}>
        <button type="button" className={styles.action} onClick={onNext} autoFocus>
          <ChevronRight size={18} /> Next test
        </button>
        <button type="button" className={styles.action} onClick={onRepeat}>
          <Repeat size={16} /> Repeat
        </button>
      </div>
      <p className={styles.hints}>
        <kbd>tab</kbd> or <kbd>enter</kbd> next test
      </p>
    </div>
  )
}

export default Results
