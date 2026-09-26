import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Badge } from "@/components/ui/badge"
import { EventFilters } from "@/components/events/event-filters"
import { EventCard, type EventCardData } from "@/components/events/event-card"
import { EmptyState } from "@/components/ui/empty-state"
import { createClient } from "@/lib/supabase/server"
import { CalendarSearch } from "lucide-react"

export const metadata = {
  title: "Explore Events — Eventify",
  description: "Browse upcoming campus workshops, networking sessions, and community gatherings.",
}

interface EventsPageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    sort?: string
  }>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { search, category, sort } = await searchParams
  const supabase = await createClient()

  // 1. Fetch categories for filter bar
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name")

  // 2. Build events query
  let query = supabase
    .from("events")
    .select(`
      *,
      category:categories(id, name, icon),
      organizer:profiles(id, full_name, avatar_url),
      registrations(id, status)
    `)
    .eq("status", "published")

  if (category) {
    query = query.eq("categories.name", category)
  }

  if (search) {
    query = query.ilike("title", `%${search}%`)
  }

  const today = new Date().toISOString().split("T")[0]

  if (sort === "past") {
    query = query.lt("event_date", today).order("event_date", { ascending: false })
  } else if (sort === "all") {
    query = query.order("event_date", { ascending: true })
  } else {
    // Default: upcoming
    query = query.gte("event_date", today).order("event_date", { ascending: true })
  }

  const { data: rawEvents, error } = await query

  // Check current user's registrations if logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userRegistrations = new Set<string>()
  if (user) {
    const { data: myRegs } = await supabase
      .from("registrations")
      .select("event_id")
      .eq("user_id", user.id)
      .eq("status", "confirmed")

    myRegs?.forEach((r) => userRegistrations.add(r.event_id))
  }

  const events: EventCardData[] = (rawEvents || []).map((e) => {
    const regs = (e.registrations as unknown as { id: string; status: string }[]) || []
    const confirmedCount = regs.filter((r) => r.status === "confirmed").length

    return {
      id: e.id,
      title: e.title,
      description: e.description,
      image_url: e.image_url,
      event_date: e.event_date,
      start_time: e.start_time,
      end_time: e.end_time,
      location: e.location,
      max_attendees: e.max_attendees,
      status: e.status,
      category: e.category as EventCardData["category"],
      organizer: e.organizer as EventCardData["organizer"],
      confirmed_count: confirmedCount,
    }
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-12 md:py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="max-w-3xl mb-8 space-y-3">
          <Badge variant="default">Campus & Public Directory</Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Explore Events
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Discover upcoming workshops, hackathons, talks, and networking mixers happening around you.
          </p>
        </div>

        {/* Filters */}
        <EventFilters categories={categories || []} />

        {/* Event Cards Grid */}
        {error ? (
          <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-center">
            <p className="font-semibold">Unable to load events.</p>
            <p className="text-xs mt-1">{error.message}</p>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isRegistered={userRegistrations.has(event.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarSearch}
            title="No events found"
            description="There are currently no events matching your selected search criteria or date filters."
            actionLabel="Reset Filters"
            actionHref="/events"
          />
        )}
      </main>

      <Footer />
    </div>
  )
}
