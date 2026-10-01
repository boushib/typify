"use client"

import classNames from "classnames"
import { AtSign, Clock, Hash, Quote, Type } from "lucide-react"
import { TIME_OPTIONS, WORD_OPTIONS, type Mode, type TestConfig } from "@/lib/engine"
import styles from "./TypingTest.module.sass"

interface Props {
  config: TestConfig
  onChange: (patch: Partial<TestConfig>) => void
  hidden: boolean
}

const MODES: { mode: Mode; label: string; icon: typeof Clock }[] = [
  { mode: "time", label: "time", icon: Clock },
  { mode: "words", label: "words", icon: Type },
  { mode: "quote", label: "quote", icon: Quote },
]

const Toggle = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button type="button" aria-pressed={active} className={classNames(styles.option, active && styles.optionActive)} onClick={onClick}>
    {children}
  </button>
)

/** Test options; fades out while typing so nothing distracts */
const ConfigBar = ({ config, onChange, hidden }: Props) => (
  <div className={classNames(styles.configBar, hidden && styles.configHidden)} aria-hidden={hidden}>
    {config.mode !== "quote" && (
      <>
        <div className={styles.group}>
          <Toggle active={config.punctuation} onClick={() => onChange({ punctuation: !config.punctuation })}>
            <AtSign size={14} /> punctuation
          </Toggle>
          <Toggle active={config.numbers} onClick={() => onChange({ numbers: !config.numbers })}>
            <Hash size={14} /> numbers
          </Toggle>
        </div>
        <span className={styles.divider} />
      </>
    )}
    <div className={styles.group}>
      {MODES.map(({ mode, label, icon: Icon }) => (
        <Toggle key={mode} active={config.mode === mode} onClick={() => onChange({ mode })}>
          <Icon size={14} /> {label}
        </Toggle>
      ))}
    </div>
    {config.mode !== "quote" && (
      <>
        <span className={styles.divider} />
        <div className={styles.group}>
          {(config.mode === "time" ? TIME_OPTIONS : WORD_OPTIONS).map(n => (
            <Toggle
              key={n}
              active={(config.mode === "time" ? config.time : config.words) === n}
              onClick={() => onChange(config.mode === "time" ? { time: n } : { words: n })}
            >
              {n}
            </Toggle>
          ))}
        </div>
      </>
    )}
  </div>
)

export default ConfigBar
