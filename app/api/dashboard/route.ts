import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/supabase/types"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's time entries for the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: timeEntries, error: entriesError } = await supabase
      .from("time_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("timestamp", sevenDaysAgo.toISOString())
      .order("timestamp", { ascending: false })

    if (entriesError) {
      console.error("Error fetching time entries:", entriesError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Get user's categories
    const { data: userCategories, error: categoriesError } = await supabase
      .from("user_categories")
      .select("categories")
      .eq("user_id", user.id)
      .single()

    if (categoriesError && categoriesError.code !== "PGRST116") {
      console.error("Error fetching categories:", categoriesError)
    }

    const categories = (userCategories?.categories as any) || {
      productive: ["github.com", "stackoverflow.com", "developer.mozilla.org"],
      unproductive: ["facebook.com", "instagram.com", "youtube.com"],
    }

    // Process data for dashboard
    const today = new Date().toISOString().split("T")[0]
    const todayEntries = timeEntries?.filter((entry) => entry.date === today) || []

    // Calculate today's stats
    const todayStats = calculateDayStats(todayEntries, categories)

    // Calculate weekly stats
    const weeklyStats = calculateWeeklyStats(timeEntries || [], categories)

    return NextResponse.json({
      todayStats,
      weeklyStats,
      categories,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function calculateDayStats(entries: any[], categories: any) {
  const siteStats: { [key: string]: number } = {}
  let totalTime = 0
  let productiveTime = 0

  entries.forEach((entry) => {
    const domain = entry.domain
    const time = entry.time_spent

    siteStats[domain] = (siteStats[domain] || 0) + time
    totalTime += time

    if (categories.productive.includes(domain)) {
      productiveTime += time
    }
  })

  const topSites = Object.entries(siteStats)
    .map(([domain, time]) => ({
      domain,
      time,
      category: categories.productive.includes(domain)
        ? "productive"
        : categories.unproductive.includes(domain)
          ? "unproductive"
          : "neutral",
    }))
    .sort((a, b) => b.time - a.time)
    .slice(0, 10)

  return {
    totalTime,
    productiveTime,
    topSites,
  }
}

function calculateWeeklyStats(entries: any[], categories: any) {
  const dailyStats: { [key: string]: { totalTime: number; productiveTime: number } } = {}
  let totalTime = 0
  let productiveTime = 0

  entries.forEach((entry) => {
    const date = entry.date
    const time = entry.time_spent
    const isProductive = categories.productive.includes(entry.domain)

    if (!dailyStats[date]) {
      dailyStats[date] = { totalTime: 0, productiveTime: 0 }
    }

    dailyStats[date].totalTime += time
    totalTime += time

    if (isProductive) {
      dailyStats[date].productiveTime += time
      productiveTime += time
    }
  })

  // Fill in missing days with zero values
  const today = new Date()
  const dailyBreakdown = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateString = date.toISOString().split("T")[0]

    dailyBreakdown.push({
      date: dateString,
      totalTime: dailyStats[dateString]?.totalTime || 0,
      productiveTime: dailyStats[dateString]?.productiveTime || 0,
    })
  }

  return {
    totalTime,
    productiveTime,
    dailyBreakdown,
  }
}
