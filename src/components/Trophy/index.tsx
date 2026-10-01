import { useId } from "react"

export type Medal = "gold" | "silver" | "bronze"

const SHADES: Record<Medal, [string, string, string]> = {
  gold: ["#fff1b8", "#f6c453", "#b8860b"],
  silver: ["#ffffff", "#c3ccd6", "#7d8a99"],
  bronze: ["#ffd9b8", "#d08a4e", "#8a4b1f"],
}

/** A trophy cup drawn in SVG, shaded for its medal */
const Trophy = ({ medal, size = 64, className }: { medal: Medal; size?: number; className?: string }) => {
  const id = useId()
  const [light, mid, dark] = SHADES[medal]
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} role="img" aria-label={`${medal} trophy`}>
      <defs>
        <linearGradient id={`${id}-cup`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={light} />
          <stop offset="45%" stopColor={mid} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
        <linearGradient id={`${id}-base`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={mid} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      {/* Handles */}
      <path d="M17 13H10v4c0 7 5 12 11 12" fill="none" stroke={`url(#${id}-cup)`} strokeWidth="4" strokeLinecap="round" />
      <path d="M47 13h7v4c0 7-5 12-11 12" fill="none" stroke={`url(#${id}-cup)`} strokeWidth="4" strokeLinecap="round" />
      {/* Cup */}
      <path d="M16 7h32v12c0 10-7 17-16 17S16 29 16 19z" fill={`url(#${id}-cup)`} />
      {/* Shine */}
      <path d="M21 10h4v10c0 5 2 9 5 11-6-1-9-6-9-12z" fill="#fff" opacity="0.45" />
      {/* Star */}
      <path
        d="M32 13l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z"
        fill="#fff"
        opacity="0.85"
      />
      {/* Stem and base */}
      <path d="M28 36h8l-1 7h-6z" fill={`url(#${id}-base)`} />
      <path d="M22 43h20l2.5 7h-25z" fill={`url(#${id}-cup)`} />
      <rect x="17" y="50" width="30" height="7" rx="2" fill={`url(#${id}-base)`} />
    </svg>
  )
}

export default Trophy
