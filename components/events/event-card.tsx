import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, ArrowUpRight } from "lucide-react"
import { formatDate, formatTime } from "@/lib/utils"

export interface EventCardData {
  id: string
  title: string
  description: string
  image_url?: string | null
  event_date: string
  start_time: string
  end_time: string
  location: string
  max_attendees: number
  status: "draft" | "published" | "cancelled" | "completed"
  category?: {
    id: string
    name: string
    icon?: string | null
  } | null
  organizer?: {
    id: string
    full_name: string
    avatar_url?: string | null
  } | null
  confirmed_count?: number
}

interface EventCardProps {
  event: EventCardData
  isRegistered?: boolean
}

export function EventCard({ event, isRegistered }: EventCardProps) {
  const confirmed = event.confirmed_count ?? 0
  const capacity = event.max_attendees
  const isFull = confirmed >= capacity
  const remaining = Math.max(0, capacity - confirmed)

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-medium hover:-translate-y-1 transition-all duration-200 border-border group bg-surface">
      {/* 16:9 Image or Vibrant Fallback Gradient */}
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-primary/15 via-accent/20 to-surface-muted">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <span className="text-4xl font-bold tracking-tighter text-primary">EVENTIFY</span>
          </div>
        )}

        {/* Category Badge overlay on bottom-left */}
        {event.category && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="default" className="bg-white/95 backdrop-blur-sm text-foreground shadow-soft border border-border/60">
              {event.category.name}
            </Badge>
          </div>
        )}

        {/* Status indicator on top-right */}
        <div className="absolute top-3 right-3">
          {isRegistered ? (
            <Badge variant="default" className="bg-primary text-white shadow-soft">
              Registered
            </Badge>
          ) : isFull ? (
            <Badge variant="destructive" className="shadow-soft">
              Sold Out
            </Badge>
          ) : remaining <= 5 ? (
            <Badge variant="accent" className="bg-amber-500 text-white shadow-soft">
              Few Seats
            </Badge>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
          {event.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
          {event.description}
        </p>
      </CardHeader>

      <CardContent className="p-5 pt-2 flex-1 space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">
            {formatDate(event.event_date)} · {formatTime(`1970-01-01T${event.start_time}`)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
      </CardContent>

      {/* Footer with capacity and CTA */}
      <CardFooter className="p-5 pt-3 border-t border-border/60 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          {isFull ? (
            <span className="text-destructive font-semibold">At capacity ({capacity})</span>
          ) : (
            <span className="text-emerald-600">
              {remaining} / {capacity} seats left
            </span>
          )}
        </div>

        <Button size="sm" variant="secondary" className="gap-1 shadow-none group-hover:bg-primary group-hover:text-white transition-all" asChild>
          <Link href={`/events/${event.id}`}>
            Details
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
