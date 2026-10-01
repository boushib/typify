import { QUOTES, type Quote } from "./quotes"
import { WORDS } from "./words"

export type Mode = "time" | "words" | "quote"

export interface TestConfig {
  mode: Mode
  /** Seconds, for the time mode */
  time: number
  /** Word count, for the words mode */
  words: number
  punctuation: boolean
  numbers: boolean
}

export const TIME_OPTIONS = [15, 30, 60, 120]
export const WORD_OPTIONS = [10, 25, 50, 100]

/** A short label like "time 30" or "words 25 · punctuation", also the personal best key */
export const configLabel = (c: TestConfig) => {
  const base = c.mode === "time" ? `time ${c.time}` : c.mode === "words" ? `words ${c.words}` : "quote"
  const extras = c.mode === "quote" ? [] : [c.punctuation && "punctuation", c.numbers && "numbers"].filter(Boolean)
  return [base, ...extras].join(" · ")
}

const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)]

const PUNCTUATION_END = [".", ".", ".", ",", ",", "?", "!", ";", ":"]

/** Random words, optionally with sentence-like punctuation and numbers mixed in */
export const generateWords = (count: number, config: Pick<TestConfig, "punctuation" | "numbers">) => {
  const words: string[] = []
  let capitalize = config.punctuation
  for (let i = 0; i < count; i++) {
    let word = config.numbers && Math.random() < 0.12 ? String(Math.floor(Math.random() * 10000)) : pick(WORDS)
    // Avoid the same word twice in a row
    if (word === words[words.length - 1]) word = pick(WORDS)
    if (config.punctuation) {
      if (capitalize) word = word[0].toUpperCase() + word.slice(1)
      capitalize = false
      const roll = Math.random()
      if (roll < 0.18 && i < count - 1) {
        const mark = pick(PUNCTUATION_END)
        word += mark
        capitalize = mark === "." || mark === "?" || mark === "!"
      } else if (roll < 0.22) word = `"${word}"`
      else if (roll < 0.25) word = `(${word})`
      if (i === count - 1 && !/[.?!]$/.test(word)) word += "."
    }
    words.push(word)
  }
  return words
}

export const randomQuote = (previous?: Quote) => {
  let quote = pick(QUOTES)
  while (quote === previous && QUOTES.length > 1) quote = pick(QUOTES)
  return quote
}

// Stats

export interface CharStats {
  correct: number
  incorrect: number
  extra: number
  missed: number
}

/** Letter-level comparison of what was typed against the target words */
export const charStats = (words: string[], inputs: string[], current: number, finished: boolean): CharStats => {
  const stats: CharStats = { correct: 0, incorrect: 0, extra: 0, missed: 0 }
  const last = Math.min(current, inputs.length - 1)
  for (let i = 0; i <= last; i++) {
    const word = words[i]
    const input = inputs[i] ?? ""
    for (let j = 0; j < Math.max(word.length, input.length); j++) {
      if (j >= input.length) {
        // Untyped letters only count as missed once the word is left behind
        if (i < current || finished) stats.missed++
      } else if (j >= word.length) stats.extra++
      else if (input[j] === word[j]) stats.correct++
      else stats.incorrect++
    }
  }
  return stats
}

/**
 * Characters that count toward WPM: every letter of correctly typed words plus
 * the space after them, and the correct start of the word in progress.
 */
export const correctChars = (words: string[], inputs: string[], current: number) => {
  let total = 0
  for (let i = 0; i < current; i++) if (inputs[i] === words[i]) total += words[i].length + 1
  const input = inputs[current] ?? ""
  const word = words[current] ?? ""
  if (input && word.startsWith(input)) total += input.length
  return total
}

export const wpm = (chars: number, ms: number) => (ms > 0 ? chars / 5 / (ms / 60000) : 0)

/**
 * Consistency of the per-second raw speed, from 0 to 100: low variation is
 * close to 100. Maps the coefficient of variation through a soft curve so a
 * few slow seconds don't drop it to zero.
 */
export const consistency = (raws: number[]) => {
  const values = raws.filter(v => v > 0)
  if (values.length < 2) return 100
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const sd = Math.sqrt(values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length)
  const cv = sd / mean
  return Math.max(0, Math.round(100 * (1 - Math.tanh(cv + cv ** 3 / 3 + cv ** 5 / 5))))
}

export interface Sample {
  second: number
  wpm: number
  raw: number
  errors: number
}

export interface Result {
  id: string
  config: TestConfig
  label: string
  wpm: number
  raw: number
  accuracy: number
  consistency: number
  chars: CharStats
  /** Test length in seconds */
  duration: number
  samples: Sample[]
  quote?: Quote
  createdAt: number
}

/** Results too short or too fast to be real typing aren't saved or ranked */
export const invalidReason = (r: Pick<Result, "duration" | "wpm">) =>
  r.duration < 1 ? "Test too short" : r.wpm > 350 ? "Speed too high to be real typing" : null
