import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { InitDemoUser } from "./init-demo-user"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Productivity Tracker",
  description: "Track your website usage and boost productivity",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <InitDemoUser />
          {children}
        </Providers>
      </body>
    </html>
  )
}
