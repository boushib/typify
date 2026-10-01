"use client"

import classNames from "classnames"
import { Flame, Play, RotateCcw, Trophy, Zap } from "lucide-react"
import { useEffect, useReducer, useRef } from "react"
import { playClick } from "@/lib/sound"
import { useStore } from "@/store"
import styles from "./Arcade.module.sass"

const ALPHABET = "abcdefghijklmnopqrstuvwxyz"
const ROUND_MS = 30_000
/** Hits closer together than this keep the combo going */
const COMBO_WINDOW = 1500

const randomLetter = (avoid?: string) => {
  let letter = avoid
  while (letter === avoid) letter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  return letter!
}

/** Every 5 hits in a row adds 1 to the multiplier, up to x5 */
export const multiplierFor = (combo: number) => Math.min(5, 1 + Math.floor(Math.max(0, combo - 1) / 5))

interface Popup {
  id: number
  text: string
  at: number
  /** Horizontal offset, so popups don't stack exactly */
  x: number
}

interface Game {
  status: "ready" | "playing" | "over"
  letter: string
  next: string
  score: number
  combo: number
  bestCombo: number
  hits: number
  misses: number
  startedAt: number
  lastHitAt: number
  now: number
  popups: Popup[]
  /** Bumped on every miss to replay the shake */
  shake: number
  /** Best score when the round started, to tell whether it was beaten */
  bestBefore: number
}

type Action = { type: "start"; now: number; best: number } | { type: "key"; key: string; now: number } | { type: "tick"; now: number }

const initial = (): Game => ({
  status: "ready",
  letter: randomLetter(),
  next: randomLetter(),
  score: 0,
  combo: 0,
  bestCombo: 0,
  hits: 0,
  misses: 0,
  startedAt: 0,
  lastHitAt: 0,
  now: 0,
  popups: [],
  shake: 0,
  bestBefore: 0,
})

let popupId = 0

const reducer = (game: Game, action: Action): Game => {
  switch (action.type) {
    case "start": {
      const fresh = initial()
      return { ...fresh, status: "playing", startedAt: action.now, now: action.now, bestBefore: action.best }
    }
    case "key": {
      if (game.status !== "playing") return game
      if (action.key !== game.letter) {
        return { ...game, combo: 0, misses: game.misses + 1, shake: game.shake + 1 }
      }
      const combo = action.now - game.lastHitAt < COMBO_WINDOW || game.hits === 0 ? game.combo + 1 : 1
      const points = multiplierFor(combo)
      return {
        ...game,
        letter: game.next,
        next: randomLetter(game.next),
        score: game.score + points,
        combo,
        bestCombo: Math.max(game.bestCombo, combo),
        hits: game.hits + 1,
        lastHitAt: action.now,
        popups: [...game.popups.slice(-5), { id: ++popupId, text: `+${points}`, at: action.now, x: (popupId % 5) * 22 - 44 }],
      }
    }
    case "tick": {
      if (game.status !== "playing") return game
      if (action.now - game.startedAt >= ROUND_MS) return { ...game, status: "over", now: action.now, popups: [] }
      // The combo runs out if you pause too long
      const combo = action.now - game.lastHitAt > COMBO_WINDOW && game.hits > 0 ? 0 : game.combo
      return { ...game, now: action.now, combo, popups: game.popups.filter(p => action.now - p.at < 800) }
    }
  }
}

const Arcade = () => {
  const [game, dispatch] = useReducer(reducer, undefined, initial)
  const best = useStore(s => s.arcadeBest)
  const setBest = useStore(s => s.setArcadeBest)
  const sound = useStore(s => s.settings.sound)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (game.status !== "playing") return
    const id = setInterval(() => dispatch({ type: "tick", now: performance.now() }), 100)
    return () => clearInterval(id)
  }, [game.status])

  useEffect(() => {
    if (game.status === "over") setBest(game.score)
  }, [game.status, game.score, setBest])

  const start = () => {
    dispatch({ type: "start", now: performance.now(), best: useStore.getState().arcadeBest })
    inputRef.current?.focus()
  }

  const press = (key: string) => {
    if (sound) playClick()
    dispatch({ type: "key", key: key.toLowerCase(), now: performance.now() })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (game.status !== "playing" && (e.key === " " || e.key === "Enter")) {
        e.preventDefault()
        start()
        return
      }
      // Letters typed into the hidden field are handled by its input event
      if (game.status === "playing" && e.target !== inputRef.current && /^[a-z]$/i.test(e.key)) press(e.key)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const elapsed = game.status === "playing" ? game.now - game.startedAt : 0
  const left = Math.max(0, ROUND_MS - elapsed)
  const multiplier = multiplierFor(game.combo)
  const attempts = game.hits + game.misses
  const accuracy = attempts ? Math.round((game.hits / attempts) * 100) : 0
  const isBest = game.status === "over" && game.score > 0 && game.score > game.bestBefore

  return (
    <div className={`container ${styles.page}`}>
      {/* Phones need a focused field to open the keyboard */}
      <input
        ref={inputRef}
        className={styles.hiddenInput}
        aria-label="Type the letter shown"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        onInput={e => {
          const data = (e.nativeEvent as InputEvent).data ?? ""
          for (const ch of data) if (/[a-z]/i.test(ch)) press(ch)
          e.currentTarget.value = ""
        }}
      />

      {game.status === "ready" && (
        <section className={styles.intro}>
          <span className={styles.badge}>
            <Zap size={14} /> arcade
          </span>
          <h1>Letter Rush</h1>
          <p>
            Type each letter as it appears. Quick hits in a row build a combo: every 5 adds to your multiplier, up to{" "}
            <strong>x5</strong>. A wrong key or a long pause resets it. You have 30 seconds.
          </p>
          <div className={styles.bestLine}>
            <Trophy size={16} /> Best score: <strong>{best}</strong>
          </div>
          <button type="button" className={styles.play} onClick={start}>
            <Play size={18} /> Start
          </button>
          <span className={styles.hint}>
            or press <kbd>space</kbd>
          </span>
        </section>
      )}

      {game.status === "playing" && (
        <section className={styles.arena} onClick={() => inputRef.current?.focus()}>
          <div className={styles.hud}>
            <div className={styles.score}>
              <span>score</span>
              <strong key={game.score} className={styles.scoreValue}>
                {game.score}
              </strong>
            </div>
            <div key={multiplier} className={classNames(styles.multiplier, styles[`multiplier${multiplier}`])}>
              <Flame size={16} /> x{multiplier}
            </div>
            <div className={styles.time}>
              <span>time</span>
              <strong className={classNames(left < 5000 && styles.timeLow)}>{(left / 1000).toFixed(1)}</strong>
            </div>
          </div>
          <div className={styles.timerBar}>
            <span style={{ transform: `scaleX(${left / ROUND_MS})` }} className={classNames(left < 5000 && styles.timerLow)} />
          </div>

          <div className={styles.stage}>
            <div key={`shake-${game.shake}`} className={classNames(styles.letterShell, game.shake > 0 && styles.shake)}>
              <div key={game.hits} className={styles.letter}>
                {game.letter}
              </div>
              {game.popups.map(p => (
                <span key={p.id} className={styles.popup} style={{ left: `calc(50% + ${p.x}px)` }}>
                  {p.text}
                </span>
              ))}
            </div>
            <div className={styles.next}>
              next <span>{game.next}</span>
            </div>
            <div className={styles.comboLine}>
              {game.combo > 1 ? (
                <span key={game.combo} className={styles.combo}>
                  {game.combo} combo
                </span>
              ) : (
                <span className={styles.comboIdle}>keep it going</span>
              )}
            </div>
          </div>
        </section>
      )}

      {game.status === "over" && (
        <section className={styles.over}>
          <h1>Time’s up!</h1>
          {isBest && (
            <div className={styles.newBest}>
              <Trophy size={16} /> New best score!
            </div>
          )}
          <div className={styles.final}>{game.score}</div>
          <dl className={styles.stats}>
            <div>
              <dt>letters</dt>
              <dd>{game.hits}</dd>
            </div>
            <div>
              <dt>misses</dt>
              <dd>{game.misses}</dd>
            </div>
            <div>
              <dt>accuracy</dt>
              <dd>{accuracy}%</dd>
            </div>
            <div>
              <dt>best combo</dt>
              <dd>{game.bestCombo}</dd>
            </div>
            <div>
              <dt>letters / min</dt>
              <dd>{Math.round((game.hits / ROUND_MS) * 60000)}</dd>
            </div>
          </dl>
          <button type="button" className={styles.play} onClick={start} autoFocus>
            <RotateCcw size={18} /> Play again
          </button>
          <span className={styles.hint}>
            or press <kbd>space</kbd> · best <strong>{Math.max(best, game.score)}</strong>
          </span>
        </section>
      )}
    </div>
  )
}

export default Arcade
