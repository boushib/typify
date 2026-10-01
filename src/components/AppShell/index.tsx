"use client"

import { useEffect } from "react"
import { useIsClient } from "@/hooks/useIsClient"
import { applyTheme, themeById } from "@/lib/themes"
import { useStore } from "@/store"
import styles from "./AppShell.module.sass"

/** Settings and history live in localStorage, so pages render in the browser only */
const AppShell = ({ children }: { children: React.ReactNode }) => {
  const isClient = useIsClient()
  const theme = useStore(s => s.settings.theme)

  useEffect(() => {
    applyTheme(themeById(theme))
  }, [theme])

  return <main className={styles.main}>{isClient ? children : <div className={styles.loading}>typify</div>}</main>
}

export default AppShell
