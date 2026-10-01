"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import "./Navbar.sass"

const Navbar = () => {
  const pathname = usePathname()
  const item = (href: string) => `nav__menu__item${pathname === href ? " active" : ""}`
  return (
  <nav className="nav">
    <div className="container nav__container">
      <Link href="/" className="nav__logo">
        Typify
      </Link>
      <div className="nav__menu">
        <Link href="/" className={item("/")}>
          Home
        </Link>
        <Link href="/leaderboard" className={item("/leaderboard")}>
          Leaderboard
        </Link>
      </div>
    </div>
  </nav>
  )
}

export default Navbar
