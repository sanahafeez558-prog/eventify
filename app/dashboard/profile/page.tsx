import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { Badge } from "@/components/ui/badge"
import { UserCheck } from "lucide-react"

export const metadata = {
  title: "My Profile — Eventify Dashboard",
  description: "View and edit your attendee and organizer profile information.",
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirect=/dashboard/profile")
  }

  // Fetch or upsert profile
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) {
    // Fallback if trigger was skipped or direct auth
    const fallbackName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User"
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        full_name: fallbackName,
        email: user.email!,
        role: "attendee",
      })
      .select("*")
      .single()

    profile = newProfile
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Badge variant="default" className="gap-1.5 mb-2">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Account Settings</span>
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Profile Information
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your display name and public organizer details across Eventify.
        </p>
      </div>

      {profile && <ProfileForm profile={profile} />}
    </div>
  )
}
