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

    const { data: userCategories, error } = await supabase
      .from("user_categories")
      .select("categories")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    const categories = (userCategories?.categories as any) || {
      productive: ["github.com", "stackoverflow.com", "developer.mozilla.org"],
      unproductive: ["facebook.com", "instagram.com", "youtube.com"],
    }

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Categories GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const { categories } = await request.json()

    if (!categories || typeof categories !== "object") {
      return NextResponse.json({ error: "Invalid categories data" }, { status: 400 })
    }

    // Upsert user categories
    const { error } = await supabase.from("user_categories").upsert({
      user_id: user.id,
      categories,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Categories POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
