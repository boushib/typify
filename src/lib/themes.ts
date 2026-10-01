export interface Theme {
  id: string
  name: string
  colors: {
    /** Page background */
    bg: string
    /** Panels, buttons, the chart area */
    "sub-alt": string
    /** Untyped letters, labels */
    sub: string
    /** Typed letters, headings */
    text: string
    /** Accent: caret, highlights, primary buttons */
    main: string
    error: string
    /** Extra letters typed past the end of a word */
    "error-extra": string
  }
}

export const THEMES: Theme[] = [
  { id: "midnight", name: "Midnight", colors: { bg: "#16171d", "sub-alt": "#1f2129", sub: "#5c6170", text: "#e4e6eb", main: "#a29bfe", error: "#ff6b81", "error-extra": "#a83a50" } },
  { id: "paper", name: "Paper", colors: { bg: "#f4f1ea", "sub-alt": "#e7e2d6", sub: "#a39d90", text: "#2e2b27", main: "#e17055", error: "#d63031", "error-extra": "#9c2a2a" } },
  { id: "ocean", name: "Ocean", colors: { bg: "#0f1b2b", "sub-alt": "#16263a", sub: "#4b6888", text: "#d4e3f1", main: "#74b9ff", error: "#ff7675", "error-extra": "#b14f4e" } },
  { id: "forest", name: "Forest", colors: { bg: "#18221f", "sub-alt": "#202e29", sub: "#5c7a6d", text: "#dde8e0", main: "#7bd389", error: "#f78c6c", "error-extra": "#a85c45" } },
  { id: "sunset", name: "Sunset", colors: { bg: "#261a2c", "sub-alt": "#33243a", sub: "#86688c", text: "#f4e5ef", main: "#fdcb6e", error: "#ff7675", "error-extra": "#b0504f" } },
  { id: "latte", name: "Latte", colors: { bg: "#fbf6ef", "sub-alt": "#f0e6d8", sub: "#b5a18b", text: "#4a3b2f", main: "#b5651d", error: "#c0392b", "error-extra": "#8e2a20" } },
  { id: "mono", name: "Mono", colors: { bg: "#111111", "sub-alt": "#1b1b1b", sub: "#555555", text: "#eeeeee", main: "#ffffff", error: "#ff4d4d", "error-extra": "#a33" } },
  { id: "matrix", name: "Matrix", colors: { bg: "#050805", "sub-alt": "#0b160b", sub: "#2a6b2a", text: "#a8ffa8", main: "#39ff14", error: "#ff3b3b", "error-extra": "#a82626" } },
]

export const themeById = (id: string) => THEMES.find(t => t.id === id) ?? THEMES[0]

/** Sets the theme's colors as CSS variables on <html> */
export const applyTheme = (theme: Theme) => {
  const root = document.documentElement
  for (const [key, value] of Object.entries(theme.colors)) root.style.setProperty(`--${key}`, value)
  root.style.colorScheme = isLight(theme) ? "light" : "dark"
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.colors.bg)
}

const isLight = (theme: Theme) => {
  const hex = theme.colors.bg.replace("#", "")
  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16))
  return (r * 299 + g * 587 + b * 114) / 1000 > 140
}

/**
 * Inline script for the document head: applies the saved theme before first
 * paint, so a light theme doesn't flash dark on load.
 */
export const themeScript = `try{var T=${JSON.stringify(Object.fromEntries(THEMES.map(t => [t.id, t.colors])))};var s=JSON.parse(localStorage.getItem("typify:v1"));var c=T[s&&s.state&&s.state.settings&&s.state.settings.theme];if(c){for(var k in c)document.documentElement.style.setProperty("--"+k,c[k])}}catch(e){}`
