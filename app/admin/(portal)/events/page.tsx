import { createClient } from "@/lib/supabase/server"
import { EventManagementClient } from "@/components/admin/event-management-client"

export default async function AdminEventsPage() {
  const supabase = await createClient()

  const [{ data: events }, { data: categories }, { data: profiles }] = await Promise.all([
    supabase
      .from("events")
      .select("*, categories(name), profiles(full_name, email)")
      .order("event_date", { ascending: true }),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("profiles").select("id, full_name, email").order("full_name"),
  ])

  return (
    <EventManagementClient
      initialEvents={(events as any) || []}
      categories={categories || []}
      organizers={profiles || []}
    />
  )
}
