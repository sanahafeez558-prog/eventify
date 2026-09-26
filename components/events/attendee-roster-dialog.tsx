"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Users, Loader2, Calendar, Mail, AlertCircle } from "lucide-react";

interface Attendee {
  id: string;
  registered_at: string;
  status: "confirmed" | "cancelled";
  profiles: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  } | null;
}

interface AttendeeRosterDialogProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  maxAttendees: number;
}

export function AttendeeRosterDialog({
  open,
  onClose,
  eventId,
  eventTitle,
  maxAttendees,
}: AttendeeRosterDialogProps) {
  const [attendees, setAttendees] = React.useState<Attendee[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !eventId) return;

    async function loadAttendees() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error: fetchErr } = await supabase
          .from("registrations")
          .select(`
            id,
            registered_at,
            status,
            profiles (
              id,
              full_name,
              email,
              avatar_url
            )
          `)
          .eq("event_id", eventId)
          .order("registered_at", { ascending: true });

        if (fetchErr) throw fetchErr;

        // Note: Supabase types profile as single object due to foreign key
        setAttendees((data as unknown as Attendee[]) || []);
      } catch (err: unknown) {
        console.error("Failed to load attendees:", err);
        setError(err instanceof Error ? err.message : "Failed to load attendees");
      } finally {
        setLoading(false);
      }
    }

    loadAttendees();
  }, [open, eventId]);

  const confirmedAttendees = attendees.filter((a) => a.status === "confirmed");
  const cancelledAttendees = attendees.filter((a) => a.status === "cancelled");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Attendee Roster"
      description={`Confirmed registrations for "${eventTitle}"`}
      className="max-w-xl"
    >
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle border border-border text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>Capacity Utilization</span>
          </div>
          <div className="font-semibold text-foreground">
            {confirmedAttendees.length} / {maxAttendees} seats booked (
            {Math.round((confirmedAttendees.length / Math.max(maxAttendees, 1)) * 100)}%)
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm">Fetching attendee records...</p>
          </div>
        ) : error ? (
          <div className="py-8 flex flex-col items-center justify-center text-destructive space-y-2 text-center">
            <AlertCircle className="w-6 h-6" />
            <p className="text-sm">{error}</p>
          </div>
        ) : confirmedAttendees.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground space-y-1">
            <p className="text-sm font-medium">No confirmed attendees yet.</p>
            <p className="text-xs">
              When users register for this event, their profile information will appear here.
            </p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 divide-y divide-border/40">
            {confirmedAttendees.map((reg) => {
              const profile = reg.profiles;
              const name = profile?.full_name || "Anonymous Attendee";
              const email = profile?.email || "No email available";

              return (
                <div
                  key={reg.id}
                  className="pt-2.5 first:pt-0 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={profile?.avatar_url || undefined}
                      fallback={name}
                      className="w-9 h-9 text-xs"
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">
                        {name}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <Badge variant="accent" className="text-[10px] py-0 px-2">
                      Confirmed
                    </Badge>
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 justify-end">
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(reg.registered_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {cancelledAttendees.length > 0 && (
          <div className="pt-2 border-t border-border text-xs text-muted-foreground">
            {cancelledAttendees.length} previous registration(s) cancelled.
          </div>
        )}

        <div className="pt-3 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-surface-subtle hover:bg-surface-muted text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
}
