import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/events/event-form";

export const metadata: Metadata = {
  title: "Create Event — Eventify",
  description: "Publish and host a new event on the Eventify platform.",
};

export default async function CreateEventPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Host a New Event
        </h1>
        <p className="text-muted-foreground mt-1">
          Fill out the details below to publish your event to the Eventify community.
        </p>
      </div>

      <EventForm categories={categories ?? []} mode="create" />
    </div>
  );
}
