import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/events/event-form";

export const metadata: Metadata = {
  title: "Edit Event — Eventify",
  description: "Update details, schedule, or capacity for your hosted event.",
};

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/dashboard/manage-events/${id}/edit`);
  }

  // Fetch the event. RLS policy ensures users can only read if published or own,
  // but for editing we must strictly verify organizer_id matches user.id
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event || event.organizer_id !== user.id) {
    notFound();
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Edit Event Details
        </h1>
        <p className="text-muted-foreground mt-1">
          Modify your event details, location, schedule, or maximum capacity.
        </p>
      </div>

      <EventForm
        categories={categories ?? []}
        mode="edit"
        eventId={event.id}
        initialData={{
          id: event.id,
          title: event.title,
          description: event.description,
          category_id: event.category_id,
          event_date: event.event_date,
          start_time: event.start_time,
          end_time: event.end_time,
          location: event.location,
          max_attendees: event.max_attendees,
          image_url: event.image_url,
          status: event.status,
        }}
      />
    </div>
  );
}
