import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // A second dev server (e.g. an agent's) can build into its own folder
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // The original letter game lived at /games/:id; it's now the arcade
  redirects: () => [{ source: "/games/:id", destination: "/arcade", permanent: true }],
}

export default nextConfig
