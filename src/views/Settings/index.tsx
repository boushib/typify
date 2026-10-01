"use client"

import classNames from "classnames"
import { Check, RotateCcw } from "lucide-react"
import { playClick } from "@/lib/sound"
import { THEMES } from "@/lib/themes"
import { DEFAULT_SETTINGS, useStore, type CaretStyle } from "@/store"
import styles from "./Settings.module.sass"

const CARETS: CaretStyle[] = ["line", "block", "underline"]
const FONT_SIZES = [
  { value: 1.25, label: "small" },
  { value: 1.75, label: "medium" },
  { value: 2.25, label: "large" },
  { value: 2.75, label: "huge" },
]

const Section = ({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) => (
  <section className={styles.section}>
    <div className={styles.sectionText}>
      <h2>{title}</h2>
      <p>{hint}</p>
    </div>
    <div className={styles.sectionControl}>{children}</div>
  </section>
)

const Switch = ({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) => (
  <button type="button" role="switch" aria-checked={on} aria-label={label} className={classNames(styles.switch, on && styles.switchOn)} onClick={() => onChange(!on)}>
    <span />
  </button>
)

const SettingsView = () => {
  const settings = useStore(s => s.settings)
  const setSettings = useStore(s => s.setSettings)

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1>Settings</h1>
        <button type="button" className={styles.reset} onClick={() => setSettings(DEFAULT_SETTINGS)}>
          <RotateCcw size={14} /> Reset to defaults
        </button>
      </header>

      <section className={styles.themes}>
        <h2>Theme</h2>
        <div className={styles.themeGrid}>
          {THEMES.map((theme, i) => {
            const c = theme.colors
            const active = settings.theme === theme.id
            return (
              <button
                key={theme.id}
                type="button"
                aria-pressed={active}
                className={classNames(styles.theme, active && styles.themeActive)}
                style={{ backgroundColor: c.bg, color: c.text, borderColor: active ? c.main : "transparent", animationDelay: `${i * 40}ms` }}
                onClick={() => setSettings({ theme: theme.id })}
              >
                <span className={styles.themeName}>
                  {theme.name}
                  {active && <Check size={14} style={{ color: c.main }} />}
                </span>
                {/* A tiny preview of typed, mistyped and untyped letters */}
                <span className={styles.themeSample}>
                  <span style={{ color: c.text }}>the </span>
                  <span style={{ color: c.error }}>qiuck</span>
                  <span className={styles.themeCaret} style={{ backgroundColor: c.main }} />
                  <span style={{ color: c.sub }}> brown fox</span>
                </span>
                <span className={styles.swatches}>
                  {[c.main, c.text, c.sub, c.error].map(color => (
                    <span key={color} style={{ backgroundColor: color }} />
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <Section title="Caret style" hint="How the cursor looks while you type.">
        <div className={styles.segmented}>
          {CARETS.map(caret => (
            <button
              key={caret}
              type="button"
              aria-pressed={settings.caret === caret}
              className={classNames(styles.segment, settings.caret === caret && styles.segmentActive)}
              onClick={() => setSettings({ caret })}
            >
              <span className={classNames(styles.caretPreview, styles[`caret_${caret}`])}>a</span>
              {caret}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Smooth caret" hint="Glide between letters instead of jumping.">
        <Switch on={settings.smoothCaret} onChange={smoothCaret => setSettings({ smoothCaret })} label="Smooth caret" />
      </Section>

      <Section title="Key sounds" hint="A soft click on every keystroke.">
        <Switch
          on={settings.sound}
          onChange={sound => {
            setSettings({ sound })
            if (sound) playClick()
          }}
          label="Key sounds"
        />
      </Section>

      <Section title="Live speed" hint="Show your WPM while the test runs.">
        <Switch on={settings.liveWpm} onChange={liveWpm => setSettings({ liveWpm })} label="Live speed" />
      </Section>

      <Section title="Font size" hint="Size of the words in the test.">
        <div className={styles.segmented}>
          {FONT_SIZES.map(size => (
            <button
              key={size.value}
              type="button"
              aria-pressed={settings.fontSize === size.value}
              className={classNames(styles.segment, settings.fontSize === size.value && styles.segmentActive)}
              onClick={() => setSettings({ fontSize: size.value })}
            >
              {size.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Leaderboard name" hint="Used when you submit a result. 2–20 letters, digits, dots, dashes or underscores.">
        <input
          className={styles.input}
          value={settings.username}
          maxLength={20}
          placeholder="your name"
          aria-label="Leaderboard name"
          onChange={e => setSettings({ username: e.target.value.replace(/[^\w.-]/g, "") })}
        />
      </Section>
    </div>
  )
}

export default SettingsView
