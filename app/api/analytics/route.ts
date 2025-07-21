import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/supabase/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "7d" // 7d, 30d, 90d
    const timezone = searchParams.get("timezone") || "UTC"

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()

    switch (period) {
      case "30d":
        startDate.setDate(startDate.getDate() - 30)
        break
      case "90d":
        startDate.setDate(startDate.getDate() - 90)
        break
      default: // 7d
        startDate.setDate(startDate.getDate() - 7)
    }

    // Get time entries for the period
    const { data: timeEntries, error: entriesError } = await supabase
      .from("time_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("timestamp", startDate.toISOString())
      .lte("timestamp", endDate.toISOString())
      .order("timestamp", { ascending: true })

    if (entriesError) {
      console.error("Error fetching time entries:", entriesError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Get user categories
    const { data: userCategories } = await supabase
      .from("user_categories")
      .select("categories")
      .eq("user_id", user.id)
      .single()

    const categories = (userCategories?.categories as any) || {
      productive: [],
      unproductive: [],
    }

    // Process analytics data
    const analytics = processAnalyticsData(timeEntries || [], categories, period)

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function processAnalyticsData(entries: any[], categories: any, period: string) {
  const dailyStats: { [key: string]: any } = {}
  const domainStats: { [key: string]: any } = {}
  const hourlyStats: { [key: number]: number } = {}

  let totalTime = 0
  let productiveTime = 0
  let unproductiveTime = 0

  // Initialize hourly stats
  for (let i = 0; i < 24; i++) {
    hourlyStats[i] = 0
  }

  entries.forEach((entry) => {
    const date = entry.date
    const domain = entry.domain
    const time = entry.time_spent
    const hour = new Date(entry.timestamp).getHours()

    // Daily stats
    if (!dailyStats[date]) {
      dailyStats[date] = {
        totalTime: 0,
        productiveTime: 0,
        unproductiveTime: 0,
        neutralTime: 0,
        domains: new Set(),
      }
    }

    dailyStats[date].totalTime += time
    dailyStats[date].domains.add(domain)

    // Domain stats
    if (!domainStats[domain]) {
      domainStats[domain] = {
        totalTime: 0,
        visits: 0,
        category: categories.productive.includes(domain)
          ? "productive"
          : categories.unproductive.includes(domain)
            ? "unproductive"
            : "neutral",
      }
    }

    domainStats[domain].totalTime += time
    domainStats[domain].visits += 1

    // Categorize time
    totalTime += time
    if (categories.productive.includes(domain)) {
      productiveTime += time
      dailyStats[date].productiveTime += time
    } else if (categories.unproductive.includes(domain)) {
      unproductiveTime += time
      dailyStats[date].unproductiveTime += time
    } else {
      dailyStats[date].neutralTime += time
    }

    // Hourly distribution
    hourlyStats[hour] += time
  })

  // Convert daily stats to array
  const dailyBreakdown = Object.entries(dailyStats)
    .map(([date, stats]: [string, any]) => ({
      date,
      totalTime: stats.totalTime,
      productiveTime: stats.productiveTime,
      unproductiveTime: stats.unproductiveTime,
      neutralTime: stats.neutralTime,
      uniqueDomains: stats.domains.size,
      productivityScore: stats.totalTime > 0 ? Math.round((stats.productiveTime / stats.totalTime) * 100) : 0,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Top domains
  const topDomains = Object.entries(domainStats)
    .map(([domain, stats]: [string, any]) => ({
      domain,
      totalTime: stats.totalTime,
      visits: stats.visits,
      category: stats.category,
      averageSession: Math.round(stats.totalTime / stats.visits),
    }))
    .sort((a, b) => b.totalTime - a.totalTime)
    .slice(0, 20)

  // Hourly breakdown
  const hourlyBreakdown = Object.entries(hourlyStats).map(([hour, time]) => ({
    hour: Number.parseInt(hour),
    time: time as number,
  }))

  // Calculate productivity trends
  const productivityScore = totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0
  const averageDailyTime = dailyBreakdown.length > 0 ? Math.round(totalTime / dailyBreakdown.length) : 0

  return {
    summary: {
      totalTime,
      productiveTime,
      unproductiveTime,
      neutralTime: totalTime - productiveTime - unproductiveTime,
      productivityScore,
      averageDailyTime,
      totalDomains: Object.keys(domainStats).length,
      period,
    },
    dailyBreakdown,
    topDomains,
    hourlyBreakdown,
    categoryBreakdown: {
      productive: Math.round((productiveTime / totalTime) * 100) || 0,
      unproductive: Math.round((unproductiveTime / totalTime) * 100) || 0,
      neutral: Math.round(((totalTime - productiveTime - unproductiveTime) / totalTime) * 100) || 0,
    },
  }
}
