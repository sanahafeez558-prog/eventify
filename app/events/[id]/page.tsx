import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { RegisterButton } from "@/components/events/register-button"
import { createClient } from "@/lib/supabase/server"
import { formatDate, formatTime } from "@/lib/utils"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  Share2,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react"

interface EventDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EventDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: event } = await supabase
    .from("events")
    .select("title, description")
    .eq("id", id)
    .single()

  if (!event) return { title: "Event Not Found — Eventify" }

  return {
    title: `${event.title} — Eventify`,
    description: event.description,
  }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch event details
  const { data: event, error } = await supabase
    .from("events")
    .select(`
      *,
      category:categories(id, name, icon),
      organizer:profiles(id, full_name, avatar_url, role),
      registrations(id, status, user_id)
    `)
    .eq("id", id)
    .single()

  if (error || !event) {
    notFound()
  }

  // Current session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const allRegistrations = (event.registrations as unknown as { id: string; status: string; user_id: string }[]) || []
  const confirmedCount = allRegistrations.filter((r) => r.status === "confirmed").length
  const isRegistered = user ? allRegistrations.some((r) => r.user_id === user.id && r.status === "confirmed") : false
  const capacity = event.max_attendees
  const isFull = confirmedCount >= capacity
  const remaining = Math.max(0, capacity - confirmedCount)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-10 md:py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground hover:text-foreground -ml-3">
            <Link href="/events">
              <ChevronLeft className="w-4 h-4" />
              Back to Events
            </Link>
          </Button>
        </div>

        {/* Hero Banner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* 16:9 Banner Image */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary/15 via-accent/20 to-surface-muted border border-border shadow-soft">
              {event.image_url ? (
                <Image
                  src={event.image_url}
                  alt={event.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-25">
                  <span className="text-6xl font-bold tracking-tighter text-primary">EVENTIFY</span>
                </div>
              )}

              {event.category && (
                <div className="absolute top-4 left-4">
                  <Badge variant="default" className="bg-white/95 backdrop-blur-md text-foreground shadow-medium border border-border/60 text-xs py-1">
                    {event.category.name}
                  </Badge>
                </div>
              )}
            </div>

            {/* Title & Metadata */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
                {event.title}
              </h1>

              {/* Organizer Row */}
              <div className="flex items-center gap-3 pt-1 pb-3 border-b border-border/80">
                <Avatar
                  src={event.organizer?.avatar_url}
                  alt={event.organizer?.full_name || "Organizer"}
                  fallback={event.organizer?.full_name || "O"}
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Organized by {event.organizer?.full_name || "Event Organizer"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {event.organizer?.role || "Host"}
                  </p>
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-semibold text-foreground">About This Event</h3>
              <div className="prose prose-slate max-w-none text-muted-foreground text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {event.description}
              </div>
            </div>

            {/* Community Standards Box */}
            <div className="p-6 rounded-2xl bg-surface-muted/60 border border-border/80 flex items-start gap-3.5">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Verified Event Registration</span>
                <p>
                  Your registration status is guarded by PostgreSQL database rules. Cancelling frees your seat immediately for fellow participants.
                </p>
              </div>
            </div>
          </div>

          {/* Registration Sidebar Card (Right 4 Cols) */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-medium space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Registration
                </span>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-2xl font-bold text-foreground">Free Access</span>
                  <Badge variant={isFull ? "destructive" : "success"}>
                    {isFull ? "Sold Out" : `${remaining} Seats Left`}
                  </Badge>
                </div>
              </div>

              {/* Event Logistics */}
              <div className="space-y-3.5 pt-2 border-t border-border/70 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-foreground block">
                      {formatDate(event.event_date, { weekday: "long" })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(event.event_date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-foreground block">
                      {formatTime(`1970-01-01T${event.start_time}`)} – {formatTime(`1970-01-01T${event.end_time}`)}
                    </span>
                    <span className="text-xs text-muted-foreground">Local campus time</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-foreground block">{event.location}</span>
                    <span className="text-xs text-muted-foreground">In-person gathering</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-foreground block">
                      {confirmedCount} Attending
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Max capacity: {capacity} attendees
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <RegisterButton
                  eventId={event.id}
                  userId={user?.id}
                  isRegistered={isRegistered}
                  isFull={isFull}
                  capacity={capacity}
                  confirmedCount={confirmedCount}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
