import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// In-memory rate limiting map for login identifier resolution & brute force prevention
const rateLimitMap = new Map<string, { count: number; firstAttempt: number }>()

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown-ip"
    const now = Date.now()
    const record = rateLimitMap.get(ip)

    if (record) {
      if (now - record.firstAttempt < 60000) {
        if (record.count >= 10) {
          return NextResponse.json(
            { error: "Too many login attempts. Please wait 1 minute before trying again." },
            { status: 429 }
          )
        }
        record.count += 1
      } else {
        rateLimitMap.set(ip, { count: 1, firstAttempt: now })
      }
    } else {
      rateLimitMap.set(ip, { count: 1, firstAttempt: now })
    }

    const body = await request.json()
    const { identifier } = body

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json({ email: null }, { status: 400 })
    }

    const trimmed = identifier.trim()

    // If identifier already contains '@', it is an email
    if (trimmed.includes("@")) {
      return NextResponse.json({ email: trimmed })
    }

    // Otherwise, resolve username from profiles table
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .ilike("username", trimmed)
      .maybeSingle()

    if (profile?.email) {
      return NextResponse.json({ email: profile.email })
    }

    // Do not reveal whether user exists - return placeholder that will safely fail in auth
    return NextResponse.json({ email: `${trimmed.toLowerCase()}@unresolved.local` })
  } catch {
    return NextResponse.json({ email: null }, { status: 500 })
  }
}
