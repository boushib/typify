"use client"

import classNames from "classnames"
import { MousePointerClick, RotateCcw } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { correctChars, invalidReason, wpm, type TestConfig } from "@/lib/engine"
import { playClick } from "@/lib/sound"
import { useStore } from "@/store"
import ConfigBar from "./ConfigBar"
import Results from "./Results"
import { toResult, useTypingTest, type TestState } from "./useTypingTest"
import Words from "./Words"
import styles from "./TypingTest.module.sass"

/** Milliseconds since the start, updated four times a second while running */
const useElapsed = (startedAt: number | null) => {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (startedAt === null) return
    const id = setInterval(() => setElapsed(performance.now() - startedAt), 250)
    return () => clearInterval(id)
  }, [startedAt])
  return startedAt === null ? 0 : elapsed
}

const LiveStats = ({ state, showWpm }: { state: TestState; showWpm: boolean }) => {
  const elapsed = useElapsed(state.status === "running" ? state.startedAt : null)
  const progress =
    state.config.mode === "time"
      ? String(Math.max(0, Math.ceil(state.config.time - elapsed / 1000)))
      : `${state.current}/${state.words.length}`
  const live = elapsed > 1000 ? Math.round(wpm(correctChars(state.words, state.inputs, state.current), elapsed)) : 0
  return (
    <div className={classNames(styles.live, state.status === "idle" && styles.liveIdle)}>
      <span className={styles.liveProgress}>{progress}</span>
      {showWpm && state.status === "running" && <span className={styles.liveWpm}>{live} wpm</span>}
    </div>
  )
}

const TypingTest = () => {
  const config = useStore(s => s.config)
  const settings = useStore(s => s.settings)
  const setConfig = useStore(s => s.setConfig)
  const addResult = useStore(s => s.addResult)
  const { state, restart, typeChar, typeSpace, backspace } = useTypingTest(config)
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(true)
  const [capsLock, setCapsLock] = useState(false)
  const [result, setResult] = useState<ReturnType<typeof toResult> | null>(null)
  const savedRun = useRef(-1)

  const focus = useCallback(() => inputRef.current?.focus(), [])

  const newTest = useCallback(
    (next: TestConfig = useStore.getState().config, repeat = false) => {
      setResult(null)
      restart(next, repeat)
      requestAnimationFrame(focus)
    },
    [restart, focus]
  )

  const changeConfig = (patch: Partial<TestConfig>) => {
    setConfig(patch)
    newTest({ ...config, ...patch })
  }

  // Save each finished test once and show its results
  useEffect(() => {
    if (state.status !== "finished" || savedRun.current === state.run) return
    savedRun.current = state.run
    const r = toResult(state)
    if (!invalidReason(r)) addResult(r)
    // A microtask keeps the state update out of the effect body
    queueMicrotask(() => setResult(r))
  }, [state, addResult])

  // Tab restarts from anywhere; any key while unfocused brings focus back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault()
        newTest()
        return
      }
      if (result && e.key === "Enter") {
        e.preventDefault()
        newTest()
        return
      }
      const typingElsewhere = e.target instanceof HTMLElement && e.target !== inputRef.current && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)
      if (!result && !typingElsewhere && !e.metaKey && !e.ctrlKey && e.key.length === 1) focus()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [newTest, focus, result])

  // Text arrives through the input event so phone keyboards work too; the
  // field keeps one space so Backspace always has something to delete
  const onInput = (e: React.FormEvent<HTMLInputElement>) => {
    const native = e.nativeEvent as InputEvent
    const el = e.currentTarget
    if (native.inputType === "deleteContentBackward") backspace(false)
    else if (native.inputType === "deleteWordBackward" || native.inputType === "deleteSoftLineBackward") backspace(true)
    else {
      const text = native.data ?? el.value.slice(1)
      for (const ch of text) {
        if (ch === " ") typeSpace()
        else typeChar(ch)
        if (settings.sound) playClick(ch === " ")
      }
    }
    el.value = " "
  }

  if (result) {
    return (
      <Results
        result={result}
        onNext={() => newTest()}
        onRepeat={() => newTest(state.config, true)}
      />
    )
  }

  const running = state.status === "running"

  return (
    <div className={styles.test} key={state.run}>
      <ConfigBar config={config} onChange={changeConfig} hidden={running} />

      <div className={styles.stage}>
        <div className={styles.stageTop}>
          <LiveStats state={state} showWpm={settings.liveWpm} />
          {capsLock && <span className={styles.capsLock}>Caps Lock is on</span>}
        </div>

        <div className={styles.wordsWrap} onClick={focus}>
          <input
            ref={inputRef}
            className={styles.hiddenInput}
            defaultValue=" "
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-label="Type the words shown"
            onInput={onInput}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => {
              setCapsLock(e.getModifierState("CapsLock"))
              // Keep the caret after the space so Backspace keeps working
              const el = e.currentTarget
              if (el.selectionStart !== el.value.length) el.setSelectionRange(el.value.length, el.value.length)
            }}
          />
          <div className={classNames(styles.wordsBox, !focused && styles.blurred)}>
            <Words
              words={state.words}
              inputs={state.inputs}
              current={state.current}
              idle={state.status === "idle"}
              focused={focused}
              caret={settings.caret}
              smoothCaret={settings.smoothCaret}
              fontSize={settings.fontSize}
            />
          </div>
          {!focused && (
            <div className={styles.focusHint}>
              <MousePointerClick size={18} /> Click here or press any key to focus
            </div>
          )}
        </div>

        {state.quote && <p className={styles.quoteSource}>— {state.quote.source}</p>}

        <button type="button" className={styles.restart} onClick={() => newTest()} aria-label="Restart test" title="Restart (Tab)">
          <RotateCcw size={20} />
        </button>
      </div>

      <p className={`${styles.hints} keyboard-only`}>
        <kbd>tab</kbd> restart · <kbd>ctrl</kbd>+<kbd>backspace</kbd> delete word
      </p>
    </div>
  )
}

export default TypingTest
