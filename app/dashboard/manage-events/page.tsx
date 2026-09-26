import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ManageEventsList, type ManagedEvent } from "@/components/events/manage-events-list";

export const metadata: Metadata = {
  title: "Manage Events — Eventify",
  description: "Manage, edit, and track registrations for the events you organize.",
};

export default async function ManageEventsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/manage-events");
  }

  const { data: events } = await supabase
    .from("events")
    .select(`
      id,
      title,
      event_date,
      start_time,
      end_time,
      location,
      max_attendees,
      status,
      image_url,
      categories (name),
      registrations (id, status)
    `)
    .eq("organizer_id", user.id)
    .order("event_date", { ascending: false });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Hosted Events
          </h1>
          <p className="text-muted-foreground mt-1">
            Track engagement, view attendee rosters, and update your published events.
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/create-event">
            <Plus className="w-4 h-4 mr-2" />
            Host New Event
          </Link>
        </Button>
      </div>

      <ManageEventsList initialEvents={(events as unknown as ManagedEvent[]) || []} />
    </div>
  );
}
