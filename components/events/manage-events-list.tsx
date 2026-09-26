"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  AlertTriangle,
  Loader2,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { AttendeeRosterDialog } from "@/components/events/attendee-roster-dialog";
import { createClient } from "@/lib/supabase/client";

export interface ManagedEvent {
  id: string;
  title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  max_attendees: number;
  status: "draft" | "published" | "cancelled" | "completed";
  image_url: string | null;
  categories: {
    name: string;
  } | null;
  registrations: Array<{
    id: string;
    status: "confirmed" | "cancelled";
  }> | null;
}

interface ManageEventsListProps {
  initialEvents: ManagedEvent[];
}

export function ManageEventsList({ initialEvents }: ManageEventsListProps) {
  const router = useRouter();
  const [events, setEvents] = React.useState<ManagedEvent[]>(initialEvents);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Delete dialog state
  const [eventToDelete, setEventToDelete] = React.useState<ManagedEvent | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Attendee roster dialog state
  const [rosterEvent, setRosterEvent] = React.useState<ManagedEvent | null>(null);

  // Filter logic
  const filteredEvents = React.useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch =
        ev.title.toLowerCase().includes(search.toLowerCase()) ||
        ev.location.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : ev.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, search, statusFilter]);

  const handleDelete = async () => {
    if (!eventToDelete) return;
    try {
      setDeleting(true);
      const supabase = createClient();
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventToDelete.id);

      if (error) throw error;

      toast.success("Event deleted successfully.");
      setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));
      setEventToDelete(null);
      router.refresh();
    } catch (err: unknown) {
      console.error("Failed to delete event:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete event. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: ManagedEvent["status"]) => {
    switch (status) {
      case "published":
        return <Badge variant="accent">Published</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (events.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="You haven't hosted any events yet"
        description="Share your passions, workshops, meetups, or conferences with our growing community."
        actionLabel="Host Your First Event"
        actionHref="/dashboard/create-event"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header controls & filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search your events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["all", "published", "draft", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-surface text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-surface/50 p-6 space-y-3">
          <p className="text-muted-foreground text-sm">No events match your current search.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const confirmedCount =
              event.registrations?.filter((r) => r.status === "confirmed").length || 0;
            const percentFilled = Math.min(
              100,
              Math.round((confirmedCount / Math.max(event.max_attendees, 1)) * 100)
            );

            return (
              <Card
                key={event.id}
                className="glass-panel overflow-hidden border-border hover:border-primary/30 transition-all shadow-soft"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Event image + Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-surface-subtle overflow-hidden flex-shrink-0 relative border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            event.image_url ||
                            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80"
                          }
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {event.categories?.name && (
                            <Badge variant="outline" className="text-xs">
                              {event.categories.name}
                            </Badge>
                          )}
                          {getStatusBadge(event.status)}
                        </div>

                        <h3 className="font-semibold text-foreground text-base sm:text-lg line-clamp-1 hover:text-primary transition-colors">
                          <Link href={`/events/${event.id}`}>{event.title}</Link>
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {new Date(event.event_date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            {event.start_time.slice(0, 5)} – {event.end_time.slice(0, 5)}
                          </span>
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </span>
                        </div>

                        {/* Capacity meter */}
                        <div className="pt-2 max-w-xs space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Registrations</span>
                            <span className="font-medium text-foreground">
                              {confirmedCount} / {event.max_attendees} ({percentFilled}%)
                            </span>
                          </div>
                          <div className="w-full bg-surface-muted h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300 rounded-full"
                              style={{ width: `${percentFilled}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap sm:flex-nowrap md:flex-col lg:flex-row items-center gap-2 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRosterEvent(event)}
                        className="flex-1 sm:flex-initial"
                      >
                        <UserCheck className="w-4 h-4 mr-1.5 text-primary" />
                        Attendees ({confirmedCount})
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1 sm:flex-initial"
                      >
                        <Link href={`/dashboard/manage-events/${event.id}/edit`}>
                          <Edit className="w-4 h-4 mr-1.5" />
                          Edit
                        </Link>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Link
                          href={`/events/${event.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View public page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEventToDelete(event)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        title="Delete Event"
        description="Are you sure you want to permanently delete this event? This action will remove the event and cancel all attendee registrations. This cannot be undone."
      >
        <div className="mt-4 space-y-4">
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              Event: <strong>{eventToDelete?.title}</strong>
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setEventToDelete(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...
                </>
              ) : (
                "Yes, Delete Event"
              )}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Attendee Roster Dialog */}
      {rosterEvent && (
        <AttendeeRosterDialog
          open={!!rosterEvent}
          onClose={() => setRosterEvent(null)}
          eventId={rosterEvent.id}
          eventTitle={rosterEvent.title}
          maxAttendees={rosterEvent.max_attendees}
        />
      )}
    </div>
  );
}
