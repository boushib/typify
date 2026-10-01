import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // A second dev server (e.g. an agent's) can build into its own folder
  distDir: process.env.NEXT_DIST_DIR || ".next",
}

export default nextConfig
