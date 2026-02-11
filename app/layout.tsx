import React from "react"
import type { Metadata, Viewport } from "next"
import { Space_Grotesk, Orbitron } from "next/font/google"

import "./globals.css"

const _spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})
const _orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
})

export const metadata: Metadata = {
  title: "Cyber Tarot - Gesture Controlled 3D Tarot Experience",
  description:
    "A gesture-controlled 3D tarot card game with cyberpunk aesthetics. Use hand gestures to shuffle, select, and reveal your fortune!",
}

export const viewport: Viewport = {
  themeColor: "#0a0a1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${_spaceGrotesk.variable} ${_orbitron.variable} font-sans antialiased overflow-hidden`}
      >
        {children}
      </body>
    </html>
  )
}
