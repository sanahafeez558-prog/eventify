"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  XCircle,
  Compass,
  Search,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";

export interface RegistrationItem {
  id: string;
  registered_at: string;
  status: "confirmed" | "cancelled";
  event: {
    id: string;
    title: string;
    description: string;
    event_date: string;
    start_time: string;
    end_time: string;
    location: string;
    image_url: string | null;
    max_attendees: number;
    status: "draft" | "published" | "cancelled" | "completed";
    category: {
      name: string;
    } | null;
  } | null;
}

interface MyRegistrationsListProps {
  initialRegistrations: RegistrationItem[];
}

export function MyRegistrationsList({
  initialRegistrations,
}: MyRegistrationsListProps) {
  const router = useRouter();
  const [registrations, setRegistrations] =
    React.useState<RegistrationItem[]>(initialRegistrations);
  const [activeTab, setActiveTab] = React.useState<"upcoming" | "past" | "cancelled">("upcoming");
  const [search, setSearch] = React.useState("");

  // Cancel dialog state
  const [itemToCancel, setItemToCancel] = React.useState<RegistrationItem | null>(null);
  const [cancelling, setCancelling] = React.useState(false);

  // Re-registering state
  const [reRegisteringId, setReRegisteringId] = React.useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredRegistrations = React.useMemo(() => {
    return registrations.filter((reg) => {
      if (!reg.event) return false;

      // Search match
      const matchesSearch =
        reg.event.title.toLowerCase().includes(search.toLowerCase()) ||
        reg.event.location.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      const isFutureOrToday = reg.event.event_date >= todayStr;

      if (activeTab === "upcoming") {
        return reg.status === "confirmed" && isFutureOrToday;
      }
      if (activeTab === "past") {
        return reg.status === "confirmed" && !isFutureOrToday;
      }
      if (activeTab === "cancelled") {
        return reg.status === "cancelled";
      }
      return true;
    });
  }, [registrations, activeTab, search, todayStr]);

  const upcomingCount = registrations.filter(
    (r) => r.status === "confirmed" && r.event && r.event.event_date >= todayStr
  ).length;

  const pastCount = registrations.filter(
    (r) => r.status === "confirmed" && r.event && r.event.event_date < todayStr
  ).length;

  const cancelledCount = registrations.filter((r) => r.status === "cancelled").length;

  const handleCancelRegistration = async () => {
    if (!itemToCancel || !itemToCancel.event) return;

    try {
      setCancelling(true);
      const supabase = createClient();

      const { error } = await supabase
        .from("registrations")
        .update({ status: "cancelled" })
        .eq("id", itemToCancel.id);

      if (error) throw error;

      toast.info("Registration cancelled. Your reserved seat has been freed.");
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === itemToCancel.id ? { ...r, status: "cancelled" } : r
        )
      );
      setItemToCancel(null);
      router.refresh();
    } catch (err: unknown) {
      console.error("Cancel failed:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to cancel registration."
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleReRegister = async (reg: RegistrationItem) => {
    if (!reg.event) return;

    try {
      setReRegisteringId(reg.id);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase
        .from("registrations")
        .upsert(
          {
            event_id: reg.event.id,
            user_id: user.id,
            status: "confirmed",
            registered_at: new Date().toISOString(),
          },
          { onConflict: "event_id,user_id" }
        )
        .select()
        .single();

      if (error) throw error;

      toast.success("Successfully re-registered for event!");
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === reg.id ? { ...r, status: "confirmed" } : r
        )
      );
      router.refresh();
    } catch (err: unknown) {
      console.error("Re-register failed:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to re-register. Event may be full."
      );
    } finally {
      setReRegisteringId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs and Search bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-subtle border border-border rounded-xl">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "upcoming"
                ? "bg-surface text-foreground shadow-soft font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "past"
                ? "bg-surface text-foreground shadow-soft font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Past ({pastCount})
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "cancelled"
                ? "bg-surface text-foreground shadow-soft font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Cancelled ({cancelledCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Input
            placeholder="Search your RSVPs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* Registrations List */}
      {filteredRegistrations.length === 0 ? (
        <EmptyState
          icon={Compass}
          title={
            search
              ? "No matching registrations found"
              : activeTab === "upcoming"
              ? "No upcoming registrations"
              : activeTab === "past"
              ? "No past registrations"
              : "No cancelled registrations"
          }
          description={
            activeTab === "upcoming"
              ? "Browse through hundreds of campus workshops, conferences, and meetups to reserve your seat."
              : "Registrations will appear here once events conclude or are cancelled."
          }
          actionLabel="Explore Live Events"
          actionHref="/events"
        />
      ) : (
        <div className="space-y-4">
          {filteredRegistrations.map((reg) => {
            const ev = reg.event;
            if (!ev) return null;

            const isCancelled = reg.status === "cancelled";

            return (
              <Card
                key={reg.id}
                className="glass-panel overflow-hidden border-border hover:border-primary/30 transition-all shadow-soft"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Event thumbnail + details */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-surface-subtle overflow-hidden flex-shrink-0 relative border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            ev.image_url ||
                            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80"
                          }
                          alt={ev.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {ev.category?.name && (
                            <Badge variant="outline" className="text-xs">
                              {ev.category.name}
                            </Badge>
                          )}
                          {isCancelled ? (
                            <Badge variant="destructive" className="text-xs">
                              Cancelled RSVP
                            </Badge>
                          ) : (
                            <Badge variant="accent" className="text-xs">
                              Confirmed RSVP
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-semibold text-foreground text-base sm:text-lg line-clamp-1 hover:text-primary transition-colors">
                          <Link href={`/events/${ev.id}`}>{ev.title}</Link>
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {new Date(ev.event_date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            {ev.start_time.slice(0, 5)} – {ev.end_time.slice(0, 5)}
                          </span>
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span className="truncate">{ev.location}</span>
                          </span>
                        </div>

                        <div className="text-[11px] text-muted-foreground pt-1">
                          Registered on{" "}
                          {new Date(reg.registered_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/events/${ev.id}`} className="gap-1.5">
                          <span>Details</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </Button>

                      {!isCancelled ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setItemToCancel(reg)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <XCircle className="w-4 h-4 mr-1.5 text-destructive" />
                          Cancel RSVP
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReRegister(reg)}
                          disabled={reRegisteringId === reg.id}
                          className="text-primary hover:bg-primary/10 border-primary/30"
                        >
                          {reRegisteringId === reg.id ? (
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                          )}
                          Re-register
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={!!itemToCancel}
        onClose={() => setItemToCancel(null)}
        title="Cancel Registration"
        description="Are you sure you want to cancel your registration for this event? Your seat will be freed up for other attendees."
      >
        <div className="mt-4 space-y-4">
          <div className="p-3 rounded-xl bg-surface-subtle border border-border text-xs text-foreground">
            Event: <strong>{itemToCancel?.event?.title}</strong>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setItemToCancel(null)}
              disabled={cancelling}
            >
              Keep My Seat
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelRegistration}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cancelling...
                </>
              ) : (
                "Yes, Cancel RSVP"
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
