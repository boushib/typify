import type { Metadata, Viewport } from "next"
import { Space_Mono } from "next/font/google"
import Navbar from "@/components/Navbar"
import "@/index.sass"

const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Typify",
  description: "Typify is an app calculating your keyboard typing speed.",
  icons: { icon: "/favicon.svg" },
}

export const viewport: Viewport = { themeColor: "#000000" }

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html lang="en" className={spaceMono.variable}>
    <body>
      <div className="app">
        <Navbar />
        {children}
      </div>
    </body>
  </html>
)

export default RootLayout
