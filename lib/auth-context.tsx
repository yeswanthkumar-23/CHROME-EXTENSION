"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

export interface User {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("productivityUser")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    // In a real app, this would validate against a backend
    const users = JSON.parse(localStorage.getItem("productivityUsers") || "[]")
    const user = users.find((u: any) => u.email === email)

    if (!user) {
      throw new Error("User not found")
    }

    if (user.password !== password) {
      throw new Error("Invalid password")
    }

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
    }

    setUser(userData)
    localStorage.setItem("productivityUser", JSON.stringify(userData))
  }

  const signUp = async (email: string, password: string) => {
    // In a real app, this would create a user in the backend
    const users = JSON.parse(localStorage.getItem("productivityUsers") || "[]")

    if (users.some((u: any) => u.email === email)) {
      throw new Error("User already exists")
    }

    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem("productivityUsers", JSON.stringify(users))

    // Auto sign in after signup
    const userData = {
      id: newUser.id,
      email: newUser.email,
    }

    setUser(userData)
    localStorage.setItem("productivityUser", JSON.stringify(userData))
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem("productivityUser")
  }

  const resetPassword = async (email: string) => {
    // In a real app, this would send a reset email
    const users = JSON.parse(localStorage.getItem("productivityUsers") || "[]")
    const userExists = users.some((u: any) => u.email === email)

    if (!userExists) {
      throw new Error("User not found")
    }

    // For demo purposes, we'll just reset the password to "password123"
    const updatedUsers = users.map((u: any) => {
      if (u.email === email) {
        return { ...u, password: "password123" }
      }
      return u
    })

    localStorage.setItem("productivityUsers", JSON.stringify(updatedUsers))

    // In a real app, we would send an email with a reset link
    console.log(`Password reset for ${email}. New password: password123`)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
