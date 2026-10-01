import type { Metadata, Viewport } from "next"
import { Space_Mono } from "next/font/google"
import AppShell from "@/components/AppShell"
import Footer from "@/components/Footer"
import InlineScript from "@/components/InlineScript"
import Navbar from "@/components/Navbar"
import { themeScript } from "@/lib/themes"
import "@/styles/globals.sass"

const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Typify · typing speed test",
  description: "Typify measures your typing speed and accuracy, with timed, word and quote tests.",
  icons: { icon: "/favicon.svg" },
}

export const viewport: Viewport = { themeColor: "#16171d" }

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html lang="en" className={spaceMono.variable} suppressHydrationWarning>
    <head>
      <InlineScript html={themeScript} />
    </head>
    <body>
      <div className="app">
        <Navbar />
        <AppShell>{children}</AppShell>
        <Footer />
      </div>
    </body>
  </html>
)

export default RootLayout
