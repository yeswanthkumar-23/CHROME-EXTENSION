"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { AuthProvider } from "@/lib/auth-context"

interface AppContextType {
  categories: {
    productive: string[]
    unproductive: string[]
  }
  updateCategories: (categories: { productive: string[]; unproductive: string[] }) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const defaultCategories = {
  productive: [
    "github.com",
    "stackoverflow.com",
    "developer.mozilla.org",
    "docs.google.com",
    "notion.so",
    "figma.com",
    "codepen.io",
    "medium.com",
    "dev.to",
    "hackernews.com",
  ],
  unproductive: [
    "facebook.com",
    "instagram.com",
    "twitter.com",
    "youtube.com",
    "netflix.com",
    "reddit.com",
    "tiktok.com",
    "twitch.tv",
  ],
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState(defaultCategories)

  useEffect(() => {
    // Load categories from localStorage on mount
    const saved = localStorage.getItem("productivity-categories")
    if (saved) {
      try {
        const parsedCategories = JSON.parse(saved)
        setCategories(parsedCategories)
      } catch (error) {
        console.error("Error loading saved categories:", error)
      }
    }
  }, [])

  const updateCategories = (newCategories: { productive: string[]; unproductive: string[] }) => {
    setCategories(newCategories)
    // Save to localStorage for persistence
    localStorage.setItem("productivity-categories", JSON.stringify(newCategories))
  }

  return <AppContext.Provider value={{ categories, updateCategories }}>{children}</AppContext.Provider>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>{children}</AppProvider>
    </AuthProvider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
