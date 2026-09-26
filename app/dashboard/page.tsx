import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CalendarCheck,
  CalendarDays,
  PlusCircle,
  Compass,
  ArrowRight,
  Sparkles,
  Ticket,
} from "lucide-react"
import { formatDate, formatTime } from "@/lib/utils"

export const metadata = {
  title: "Dashboard Overview — Eventify",
  description: "Manage your registered events, created events, and community activities.",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirect=/dashboard")
  }

  // 1. Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // 2. Fetch user's registrations count
  const { count: registrationCount } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "confirmed")

  // 3. Fetch user's created events count
  const { count: hostedCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("organizer_id", user.id)

  // 4. Fetch user's upcoming registered events
  const { data: upcomingRegistrations } = await supabase
    .from("registrations")
    .select(`
      id,
      registered_at,
      status,
      event:events(id, title, event_date, start_time, location, category:categories(name))
    `)
    .eq("user_id", user.id)
    .eq("status", "confirmed")
    .order("registered_at", { ascending: false })
    .limit(3)

  const displayName = profile?.full_name || user.email?.split("@")[0] || "Friend"

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-surface border border-border shadow-soft">
        <div className="space-y-1">
          <Badge variant="accent" className="gap-1.5 py-1 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Attendee & Organizer Portal</span>
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {displayName}!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Here is what&apos;s happening with your campus and community events.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Button size="sm" asChild className="gap-1.5 shadow-soft">
            <Link href="/dashboard/create-event">
              <PlusCircle className="w-4 h-4" />
              Host Event
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/events" className="gap-1.5">
              <Compass className="w-4 h-4" />
              Explore
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              RSVPs Confirmed
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-foreground">{registrationCount || 0}</span>
            <p className="text-xs text-muted-foreground mt-1">Events you are attending</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Events Hosted
            </span>
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-foreground">{hostedCount || 0}</span>
            <p className="text-xs text-muted-foreground mt-1">Events created by you</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Account Role
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-foreground capitalize">
              {profile?.role || "Attendee"}
            </span>
            <p className="text-xs text-muted-foreground mt-1">Blended attendance & hosting</p>
          </div>
        </Card>
      </div>

      {/* Recent RSVPs list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Your Upcoming RSVPs</h2>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/dashboard/events" className="gap-1">
              View All ({registrationCount || 0})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {upcomingRegistrations && upcomingRegistrations.length > 0 ? (
          <div className="space-y-3">
            {upcomingRegistrations.map((reg) => {
              const event = reg.event as unknown as {
                id: string
                title: string
                event_date: string
                start_time: string
                location: string
                category?: { name: string } | null
              } | null

              if (!event) return null

              return (
                <div
                  key={reg.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-border shadow-soft hover:border-primary/40 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-[10px] py-0.5">
                        {event.category?.name || "Event"}
                      </Badge>
                      <Badge variant="success" className="text-[10px] py-0.5">
                        Confirmed
                      </Badge>
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{event.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(event.event_date)} at {formatTime(`1970-01-01T${event.start_time}`)} · {event.location}
                    </p>
                  </div>

                  <Button size="sm" variant="secondary" asChild className="shrink-0">
                    <Link href={`/events/${event.id}`}>View Event</Link>
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-surface border border-dashed border-border text-center space-y-3">
            <Ticket className="w-7 h-7 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold text-foreground">No upcoming registrations</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You haven&apos;t registered for any events yet. Explore upcoming workshops and sessions!
            </p>
            <Button size="sm" asChild className="mt-2">
              <Link href="/events">Explore Campus Events</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
