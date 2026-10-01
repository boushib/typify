"use client"

import { useCallback, useEffect, useReducer } from "react"
import {
  charStats,
  configLabel,
  consistency,
  correctChars,
  generateWords,
  randomQuote,
  wpm,
  type Result,
  type Sample,
  type TestConfig,
} from "@/lib/engine"
import type { Quote } from "@/lib/quotes"

export type Status = "idle" | "running" | "finished"

export interface TestState {
  config: TestConfig
  words: string[]
  /** What was typed for each word so far */
  inputs: string[]
  current: number
  status: Status
  startedAt: number | null
  endedAt: number | null
  /** Character keystrokes, spaces included */
  keystrokes: number
  correctKeystrokes: number
  samples: Sample[]
  /** Keystrokes and errors since the last sample */
  secKeys: number
  secErrors: number
  quote?: Quote
  /** Changes on every restart, so the view can replay its entrance */
  run: number
}

type Action =
  | { type: "reset"; config: TestConfig; repeat?: boolean }
  | { type: "char"; char: string; now: number }
  | { type: "space"; now: number }
  | { type: "backspace"; word: boolean }
  | { type: "tick"; now: number }

const TIME_MODE_BATCH = 60
/** Typing past the end of a word stops after this many extra letters */
const MAX_EXTRA = 12

const buildWords = (config: TestConfig, previous?: Quote) => {
  if (config.mode === "quote") {
    const quote = randomQuote(previous)
    return { words: quote.text.split(" "), quote }
  }
  const count = config.mode === "words" ? config.words : TIME_MODE_BATCH
  return { words: generateWords(count, config), quote: undefined }
}

const fresh = (config: TestConfig, run: number, words: string[], quote?: Quote): TestState => ({
  config,
  words,
  inputs: [""],
  current: 0,
  status: "idle",
  startedAt: null,
  endedAt: null,
  keystrokes: 0,
  correctKeystrokes: 0,
  samples: [],
  secKeys: 0,
  secErrors: 0,
  quote,
  run,
})

/** Closes the test, adding a last sample for the partial second */
const finish = (state: TestState, endedAt: number): TestState => {
  const elapsed = endedAt - (state.startedAt ?? endedAt)
  const partial = elapsed / 1000 - state.samples.length
  const samples =
    partial > 0.2
      ? [
          ...state.samples,
          {
            second: Math.round((elapsed / 1000) * 10) / 10,
            wpm: Math.round(wpm(correctChars(state.words, state.inputs, state.current), elapsed)),
            raw: Math.round((state.secKeys / partial) * 12),
            errors: state.secErrors,
          },
        ]
      : state.samples
  return { ...state, status: "finished", endedAt, samples }
}

const reducer = (state: TestState, action: Action): TestState => {
  switch (action.type) {
    case "reset": {
      if (action.repeat) return fresh(action.config, state.run + 1, state.words, state.quote)
      const { words, quote } = buildWords(action.config, state.quote)
      return fresh(action.config, state.run + 1, words, quote)
    }

    case "char": {
      if (state.status === "finished") return state
      const word = state.words[state.current]
      const input = state.inputs[state.current] ?? ""
      if (input.length >= word.length + MAX_EXTRA) return state
      const next = input + action.char
      const correct = word[input.length] === action.char
      const inputs = [...state.inputs]
      inputs[state.current] = next
      let s: TestState = {
        ...state,
        inputs,
        status: "running",
        startedAt: state.startedAt ?? action.now,
        keystrokes: state.keystrokes + 1,
        correctKeystrokes: state.correctKeystrokes + (correct ? 1 : 0),
        secKeys: state.secKeys + 1,
        secErrors: state.secErrors + (correct ? 0 : 1),
      }
      // Fixed-length tests end as soon as the last word is typed correctly
      const last = state.current === state.words.length - 1
      if (last && state.config.mode !== "time" && next === word) s = finish(s, action.now)
      return s
    }

    case "space": {
      if (state.status !== "running") return state
      const word = state.words[state.current]
      const input = state.inputs[state.current] ?? ""
      if (!input) return state
      const correct = input === word
      let s: TestState = {
        ...state,
        keystrokes: state.keystrokes + 1,
        correctKeystrokes: state.correctKeystrokes + (correct ? 1 : 0),
        secKeys: state.secKeys + 1,
        secErrors: state.secErrors + (correct ? 0 : 1),
      }
      if (state.current === state.words.length - 1 && state.config.mode !== "time") return finish(s, action.now)
      s = { ...s, current: state.current + 1, inputs: [...state.inputs, ""] }
      // Timed tests never run out of words
      if (state.config.mode === "time" && s.current > s.words.length - 25) {
        s.words = [...s.words, ...generateWords(TIME_MODE_BATCH, state.config)]
      }
      return s
    }

    case "backspace": {
      if (state.status === "finished") return state
      const input = state.inputs[state.current] ?? ""
      const inputs = [...state.inputs]
      if (input) {
        inputs[state.current] = action.word ? "" : input.slice(0, -1)
        return { ...state, inputs }
      }
      // Going back is only allowed into a word that has a mistake
      const prev = state.current - 1
      if (prev < 0 || state.inputs[prev] === state.words[prev]) return state
      inputs.pop()
      if (action.word) inputs[prev] = ""
      return { ...state, inputs, current: prev }
    }

    case "tick": {
      if (state.status !== "running" || state.startedAt === null) return state
      const elapsed = action.now - state.startedAt
      const limit = state.config.mode === "time" ? state.config.time * 1000 : Infinity
      if (elapsed >= limit) return finish(state, state.startedAt + limit)
      // Returning the same state object skips the re-render between seconds
      if (Math.floor(elapsed / 1000) <= state.samples.length) return state
      const second = state.samples.length + 1
      return {
        ...state,
        samples: [
          ...state.samples,
          {
            second,
            wpm: Math.round(wpm(correctChars(state.words, state.inputs, state.current), second * 1000)),
            raw: state.secKeys * 12,
            errors: state.secErrors,
          },
        ],
        secKeys: 0,
        secErrors: 0,
      }
    }
  }
}

/** Final numbers for a finished test */
export const toResult = (s: TestState): Result => {
  const ms = (s.endedAt ?? 0) - (s.startedAt ?? 0)
  const timed = s.config.mode === "time"
  return {
    id: crypto.randomUUID(),
    config: s.config,
    label: configLabel(s.config),
    wpm: Math.round(wpm(correctChars(s.words, s.inputs, s.current), ms) * 100) / 100,
    raw: Math.round(wpm(s.keystrokes, ms) * 100) / 100,
    accuracy: s.keystrokes ? Math.round((s.correctKeystrokes / s.keystrokes) * 10000) / 100 : 0,
    consistency: consistency(s.samples.map(x => x.raw)),
    // In a timed test the word being typed when time runs out isn't "missed"
    chars: charStats(s.words, s.inputs, s.current, !timed),
    duration: Math.round(ms / 100) / 10,
    samples: s.samples,
    quote: s.quote,
    createdAt: Date.now(),
  }
}

export const useTypingTest = (config: TestConfig) => {
  const [state, dispatch] = useReducer(reducer, config, c => {
    const { words, quote } = buildWords(c)
    return fresh(c, 0, words, quote)
  })

  // Samples each second and ends timed tests on time
  useEffect(() => {
    if (state.status !== "running") return
    const id = setInterval(() => dispatch({ type: "tick", now: performance.now() }), 100)
    return () => clearInterval(id)
  }, [state.status])

  const restart = useCallback((next: TestConfig, repeat = false) => dispatch({ type: "reset", config: next, repeat }), [])
  const typeChar = useCallback((char: string) => dispatch({ type: "char", char, now: performance.now() }), [])
  const typeSpace = useCallback(() => dispatch({ type: "space", now: performance.now() }), [])
  const backspace = useCallback((word: boolean) => dispatch({ type: "backspace", word }), [])

  return { state, restart, typeChar, typeSpace, backspace }
}
