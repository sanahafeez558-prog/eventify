import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Compass } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  MyRegistrationsList,
  type RegistrationItem,
} from "@/components/dashboard/my-registrations-list";

export const metadata: Metadata = {
  title: "My Registrations — Eventify",
  description: "View and manage your confirmed RSVPs and event registrations.",
};

export default async function MyEventsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/events");
  }

  const { data: registrations } = await supabase
    .from("registrations")
    .select(`
      id,
      registered_at,
      status,
      event:events (
        id,
        title,
        description,
        event_date,
        start_time,
        end_time,
        location,
        image_url,
        max_attendees,
        status,
        category:categories (name)
      )
    `)
    .eq("user_id", user.id)
    .order("registered_at", { ascending: false });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Registrations
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your reserved seats, review event schedules, or manage RSVPs.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/events">
            <Compass className="w-4 h-4 mr-2" />
            Discover Events
          </Link>
        </Button>
      </div>

      <MyRegistrationsList
        initialRegistrations={
          (registrations as unknown as RegistrationItem[]) || []
        }
      />
    </div>
  );
}
