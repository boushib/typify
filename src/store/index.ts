"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { Result, TestConfig } from "@/lib/engine"

export type CaretStyle = "line" | "block" | "underline"

export interface Settings {
  theme: string
  caret: CaretStyle
  smoothCaret: boolean
  sound: boolean
  liveWpm: boolean
  /** Font size of the test words, in rem */
  fontSize: number
  username: string
}

interface State {
  config: TestConfig
  settings: Settings
  /** Newest first */
  history: Result[]
  /** Best Letter Rush score */
  arcadeBest: number
  setConfig: (patch: Partial<TestConfig>) => void
  setSettings: (patch: Partial<Settings>) => void
  addResult: (result: Result) => void
  clearHistory: () => void
  setArcadeBest: (score: number) => void
}

const MAX_HISTORY = 500

export const DEFAULT_SETTINGS: Settings = {
  theme: "midnight",
  caret: "line",
  smoothCaret: true,
  sound: false,
  liveWpm: true,
  fontSize: 1.75,
  username: "",
}

export const useStore = create<State>()(
  persist(
    set => ({
      config: { mode: "time", time: 30, words: 25, punctuation: false, numbers: false },
      settings: DEFAULT_SETTINGS,
      history: [],
      arcadeBest: 0,
      setConfig: patch => set(s => ({ config: { ...s.config, ...patch } })),
      setSettings: patch => set(s => ({ settings: { ...s.settings, ...patch } })),
      addResult: result => set(s => ({ history: [result, ...s.history].slice(0, MAX_HISTORY) })),
      clearHistory: () => set({ history: [] }),
      setArcadeBest: score => set(s => ({ arcadeBest: Math.max(s.arcadeBest, score) })),
    }),
    {
      name: "typify:v1",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ config, settings, history, arcadeBest }) => ({ config, settings, history, arcadeBest }),
      // Settings added in later versions get their defaults
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>
        return { ...current, ...p, settings: { ...DEFAULT_SETTINGS, ...p.settings } }
      },
    }
  )
)

/** Best result for a test type (by WPM), from newest-first history */
export const personalBest = (history: Result[], label: string) =>
  history.filter(r => r.label === label).reduce<Result | undefined>((best, r) => (!best || r.wpm > best.wpm ? r : best), undefined)
