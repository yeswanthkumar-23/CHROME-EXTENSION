"use client"

import { useEffect } from "react"

export function InitDemoUser() {
  useEffect(() => {
    // Initialize demo user if it doesn't exist
    const users = JSON.parse(localStorage.getItem("productivityUsers") || "[]")

    if (!users.some((u: any) => u.email === "demo@example.com")) {
      users.push({
        id: "demo_user",
        email: "demo@example.com",
        password: "demo123",
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem("productivityUsers", JSON.stringify(users))
      console.log("Demo user created")
    }
  }, [])

  return null
}
