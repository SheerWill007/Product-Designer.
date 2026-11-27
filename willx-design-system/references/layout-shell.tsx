// Root layout skeleton for a willx-style site (app/layout.tsx).
// Fonts as CSS variables, theme + smooth scroll + music providers, and the fixed
// corner widgets. Swap the widget imports for whichever ones the site uses.
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { Geist_Mono, IBM_Plex_Mono } from "next/font/google"
import SmoothScroll from "@/components/SmoothScroll" // web-motion
import MusicProvider from "@/components/music/MusicProvider" // ambient-music-player
import RecordPlayer from "@/components/music/RecordPlayer" // ambient-music-player
import ControlDial from "@/components/ControlDial" // skeuomorphic-controls
import CustomCursor from "@/components/CustomCursor" // custom-cursor

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-geist-mono",
})

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
})

export const metadata: Metadata = {
  title: { default: "Name - Software Engineer", template: "%s | Name" },
  description: "Design engineer.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: next-themes sets the class before React hydrates
    <html lang="en" suppressHydrationWarning className={`${geistMono.variable} ${plexMono.variable}`}>
      <body className="font-geist bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SmoothScroll>
            <MusicProvider>
              <CustomCursor />

              {/* Top fade so content dissolves under the fixed chrome */}
              <div className="pointer-events-none fixed left-0 top-0 z-40 h-32 w-full bg-gradient-to-b from-background via-background/80 to-transparent" />

              {/* Corner widgets: keep them small, and check they never cover content on phones */}
              <div className="fixed bottom-3 left-3 z-50">
                <RecordPlayer />
              </div>
              <div className="fixed bottom-3 right-3 z-50">
                <ControlDial />
              </div>

              {children}
            </MusicProvider>
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  )
}
