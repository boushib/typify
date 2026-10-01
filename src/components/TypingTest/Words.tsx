"use client"

import classNames from "classnames"
import { memo, useLayoutEffect, useRef } from "react"
import type { CaretStyle } from "@/store"
import styles from "./TypingTest.module.sass"

interface Props {
  words: string[]
  inputs: string[]
  current: number
  idle: boolean
  focused: boolean
  caret: CaretStyle
  smoothCaret: boolean
  fontSize: number
}

/** One word; memoized so only the word being typed re-renders per keystroke */
const Word = memo(function Word({ word, input, state }: { word: string; input: string | undefined; state: "past" | "current" | "future" }) {
  const typed = input ?? ""
  const extra = typed.slice(word.length)
  return (
    <div className={classNames(styles.word, state === "past" && typed !== word && styles.wordError)}>
      {[...word].map((letter, i) => (
        <span
          key={i}
          className={classNames(
            styles.letter,
            i < typed.length && (typed[i] === letter ? styles.correct : styles.incorrect)
          )}
        >
          {letter}
        </span>
      ))}
      {[...extra].map((letter, i) => (
        <span key={`x${i}`} className={classNames(styles.letter, styles.extra)}>
          {letter}
        </span>
      ))}
    </div>
  )
})

const Words = ({ words, inputs, current, idle, focused, caret, smoothCaret, fontSize }: Props) => {
  const innerRef = useRef<HTMLDivElement>(null)
  const caretRef = useRef<HTMLSpanElement>(null)
  const input = inputs[current] ?? ""

  // Place the caret and scroll lines straight from the DOM after each render
  useLayoutEffect(() => {
    const inner = innerRef.current
    const wordEl = inner?.children[current] as HTMLElement | undefined
    if (!inner || !wordEl) return

    // Keep the current word on the second line once the first line is done
    const y = wordEl.offsetTop
    const shift = Math.max(0, y - wordEl.offsetHeight)
    inner.style.transform = `translateY(${-shift}px)`

    const caretEl = caretRef.current
    if (!caretEl) return
    const letters = wordEl.children
    const target = letters[input.length] as HTMLElement | undefined
    const lastLetter = letters[letters.length - 1] as HTMLElement | undefined
    const x = wordEl.offsetLeft + (target ? target.offsetLeft : lastLetter ? lastLetter.offsetLeft + lastLetter.offsetWidth : 0)
    // The caret sits outside the scrolled layer, so it takes the shift itself
    caretEl.style.transform = `translate(${x}px, ${y - shift}px)`
    caretEl.style.height = `${wordEl.offsetHeight}px`
    caretEl.style.width = caret === "line" ? "" : `${(target ?? lastLetter)?.offsetWidth ?? 12}px`
  }, [current, input, words, caret, fontSize, focused])

  return (
    <div className={styles.words} style={{ fontSize: `${fontSize}rem` }}>
      <div ref={innerRef} className={styles.wordsInner}>
        {words.map((word, i) => (
          <Word key={i} word={word} input={i <= current ? inputs[i] : undefined} state={i < current ? "past" : i === current ? "current" : "future"} />
        ))}
      </div>
      {focused && (
        <span
          ref={caretRef}
          className={classNames(
            styles.caret,
            styles[`caret_${caret}`],
            smoothCaret && styles.caretSmooth,
            idle && styles.caretBlink
          )}
          aria-hidden
        />
      )}
    </div>
  )
}

export default Words
