"use client"

import classNames from "classnames"
import { ChartNoAxesColumn, Crown, Keyboard, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "./Navbar.module.sass"

export const NAV = [
  { href: "/", label: "test", icon: Keyboard },
  { href: "/leaderboard", label: "leaderboard", icon: Crown },
  { href: "/stats", label: "stats", icon: ChartNoAxesColumn },
  { href: "/settings", label: "settings", icon: Settings },
]

const Navbar = () => {
  const pathname = usePathname()
  return (
    <header className={styles.header}>
      <nav className={`container ${styles.nav}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>
            <Keyboard size={22} strokeWidth={2.2} />
          </span>
          <span className={styles.logoText}>
            <span className={styles.logoSmall}>speed test</span>
            typify
          </span>
        </Link>
        <div className={styles.menu}>
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={classNames(styles.item, pathname === href && styles.active)}
              aria-current={pathname === href ? "page" : undefined}
              title={label}
            >
              <Icon size={18} />
              <span className={styles.label}>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
