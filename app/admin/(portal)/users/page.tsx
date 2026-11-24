import { createClient } from "@/lib/supabase/server"
import { UserManagementClient } from "@/components/admin/user-management-client"

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  return <UserManagementClient initialUsers={profiles || []} />
}
