import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EventCard, type EventCardData } from "@/components/events/event-card"
import { createClient } from "@/lib/supabase/server"
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
  Users2,
  Ticket,
  Laptop,
  Briefcase,
  GraduationCap,
  Wrench,
  Film,
  Trophy,
  Heart,
  HelpCircle,
} from "lucide-react"

// Icon resolver for dynamic categories
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Laptop,
  Briefcase,
  GraduationCap,
  Users: Users2,
  Wrench,
  Film,
  Trophy,
  Heart,
}

export default async function Home() {
  const supabase = await createClient()

  // 1. Fetch live categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  // 2. Fetch featured events (upcoming published events)
  const today = new Date().toISOString().split("T")[0]
  const { data: rawEvents } = await supabase
    .from("events")
    .select(`
      *,
      category:categories(id, name, icon),
      organizer:profiles(id, full_name, avatar_url),
      registrations(id, status)
    `)
    .eq("status", "published")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(3)

  // Current session
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

  const featuredEvents: EventCardData[] = (rawEvents || []).map((e) => {
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

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 px-4 md:px-8 relative overflow-hidden flex flex-col items-center justify-center text-center">
          {/* Subtle Decorative Glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-primary/10 via-accent/15 to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Discover. Connect. Experience.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.12]">
              Campus & Community Events,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                All in One Place
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg leading-relaxed">
              Find upcoming tech talks, hands-on workshops, and networking mixers across your campus. Register in one tap with real-time seat availability.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button size="lg" className="shadow-medium gap-2 text-base" asChild>
                <Link href="/events">
                  Browse All Events
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-base" asChild>
                <Link href="/dashboard/create-event">Host an Event</Link>
              </Button>
            </div>
          </div>

          {/* Categories Grid on Hero */}
          {categories && categories.length > 0 && (
            <div className="max-w-5xl mx-auto w-full mt-16 text-left">
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Popular Categories
                </span>
                <Link href="/categories" className="text-xs text-primary font-medium hover:underline">
                  View All ({categories.length})
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                {categories.map((category) => {
                  const IconComponent = (category.icon && iconMap[category.icon]) || HelpCircle
                  return (
                    <Link
                      key={category.id}
                      href={`/events?category=${encodeURIComponent(category.name)}`}
                      className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-surface border border-border shadow-soft hover:border-primary/40 hover:shadow-medium hover:-translate-y-0.5 transition-all duration-150 text-center group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-foreground line-clamp-1">{category.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </section>

        {/* Featured Events Section */}
        <section className="w-full py-16 px-4 md:px-8 border-t border-border/60 bg-surface-muted/30">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div>
                <Badge variant="accent" className="mb-2">Happening Soon</Badge>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Upcoming Featured Events
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Discover top-rated sessions and secure your spot before seats fill up.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/events" className="gap-1.5">
                  View Full Schedule
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>

            {featuredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isRegistered={userRegistrations.has(event.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-10 rounded-2xl bg-surface border border-dashed border-border text-center space-y-3">
                <Ticket className="w-8 h-8 text-muted-foreground mx-auto" />
                <h3 className="text-base font-semibold text-foreground">No upcoming events yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Be the first organizer to post a workshop, talk, or meetup!
                </p>
                <Button size="sm" asChild className="mt-2">
                  <Link href="/dashboard/create-event">Create the First Event</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-20 px-4 md:px-8 border-t border-border/60">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="default">Simplified Process</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                How Eventify Works
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Whether attending or hosting, manage everything through a single unified account.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-surface border border-border shadow-soft space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  1
                </div>
                <h3 className="text-lg font-semibold text-foreground">Browse & Filter</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Search across campus categories, dates, and locations to find sessions aligned with your goals.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-surface border border-border shadow-soft space-y-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">
                  2
                </div>
                <h3 className="text-lg font-semibold text-foreground">One-Tap Registration</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Instantly confirm your RSVP. Postgres database capacity triggers ensure registration counts are always exact.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-surface border border-border shadow-soft space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-lg">
                  3
                </div>
                <h3 className="text-lg font-semibold text-foreground">Host Your Own</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Publish your event in under 2 minutes. Track attendee lists and manage registrations in real time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="w-full py-16 px-4 md:px-8 border-t border-border/60">
          <div className="max-w-5xl mx-auto glass-panel p-8 sm:p-12 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Ready to bring your campus community together?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Create your account in seconds and host workshops, club sessions, and networking nights with zero hassle.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild className="gap-2">
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/events">Explore Events</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
