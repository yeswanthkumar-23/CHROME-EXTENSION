import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/supabase/types"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { entries } = await request.json()

    if (!Array.isArray(entries)) {
      return NextResponse.json({ error: "Invalid entries data" }, { status: 400 })
    }

    // Process entries in batches to avoid overwhelming the database
    const batchSize = 100
    const results = []

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize)

      const processedEntries = batch.map((entry: any) => ({
        user_id: user.id,
        domain: entry.domain,
        url: entry.url || null,
        title: entry.title || null,
        favicon: entry.favicon || null,
        time_spent: entry.timeSpent,
        timestamp: new Date(entry.timestamp).toISOString(),
        date: entry.date,
      }))

      const { data, error } = await supabase.from("time_entries").insert(processedEntries).select()

      if (error) {
        console.error("Batch insert error:", error)
        // Continue with other batches even if one fails
        results.push({ success: false, error: error.message, batch: i / batchSize + 1 })
      } else {
        results.push({ success: true, count: data.length, batch: i / batchSize + 1 })
      }
    }

    return NextResponse.json({
      success: true,
      totalEntries: entries.length,
      results,
    })
  } catch (error) {
    console.error("Sync API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
