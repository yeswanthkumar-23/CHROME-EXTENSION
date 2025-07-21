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

    const body = await request.json()
    const { domain, url, title, favicon, timeSpent, timestamp, date } = body

    // Validate required fields
    if (!domain || !timeSpent || !timestamp || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert time entry
    const { error } = await supabase.from("time_entries").insert({
      user_id: user.id,
      domain,
      url: url || null,
      title: title || null,
      favicon: favicon || null,
      time_spent: timeSpent,
      timestamp: new Date(timestamp).toISOString(),
      date,
    })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Track API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
