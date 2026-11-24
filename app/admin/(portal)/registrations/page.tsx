import { createClient } from "@/lib/supabase/server"
import { RegistrationManagementClient } from "@/components/admin/registration-management-client"

export default async function AdminRegistrationsPage() {
  const supabase = await createClient()

  const [{ data: registrations }, { data: events }, { data: profiles }] = await Promise.all([
    supabase
      .from("registrations")
      .select("*, events(title, event_date, location), profiles(full_name, email)")
      .order("registered_at", { ascending: false }),
    supabase.from("events").select("id, title, event_date").order("title"),
    supabase.from("profiles").select("id, full_name, email").order("full_name"),
  ])

  return (
    <RegistrationManagementClient
      initialRegistrations={(registrations as any) || []}
      events={events || []}
      users={profiles || []}
    />
  )
}
