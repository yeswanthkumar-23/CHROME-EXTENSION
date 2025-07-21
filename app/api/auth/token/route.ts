import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "No active session" }, { status: 401 })
    }

    return NextResponse.json({
      token: session.access_token,
      user: session.user,
    })
  } catch (error) {
    console.error("Token API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
