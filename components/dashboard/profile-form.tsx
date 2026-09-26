"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { profileSchema, type ProfileFormData } from "@/lib/validations/auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Save, Loader2, Mail } from "lucide-react"

interface ProfileFormProps {
  profile: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
    role: "attendee" | "organizer" | "admin"
  }
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name,
      avatar_url: profile.avatar_url || "",
    },
  })

  const avatarUrlWatch = watch("avatar_url")
  const fullNameWatch = watch("full_name")

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          avatar_url: data.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) throw error

      toast.success("Profile updated successfully!")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar Preview */}
      <div className="flex items-center gap-5 p-5 rounded-2xl bg-surface border border-border shadow-soft">
        <Avatar
          src={avatarUrlWatch || profile.avatar_url}
          alt={fullNameWatch || profile.full_name}
          fallback={fullNameWatch || profile.full_name}
          className="w-16 h-16 text-lg"
        />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">
              {fullNameWatch || profile.full_name}
            </h3>
            <Badge variant="accent" className="capitalize text-[10px]">
              {profile.role}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            {profile.email}
          </p>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-4 p-6 rounded-2xl bg-surface border border-border shadow-soft">
        <div className="space-y-1.5">
          <label htmlFor="full_name" className="text-xs font-semibold text-foreground">
            Display Name
          </label>
          <Input
            id="full_name"
            placeholder="Ayesha Khan"
            {...register("full_name")}
            className={errors.full_name ? "border-destructive focus-visible:border-destructive" : ""}
          />
          {errors.full_name && (
            <p className="text-xs text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="avatar_url" className="text-xs font-semibold text-foreground">
            Avatar Image URL (Optional)
          </label>
          <Input
            id="avatar_url"
            placeholder="https://images.unsplash.com/photo-..."
            {...register("avatar_url")}
            className={errors.avatar_url ? "border-destructive focus-visible:border-destructive" : ""}
          />
          {errors.avatar_url && (
            <p className="text-xs text-destructive">{errors.avatar_url.message}</p>
          )}
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-semibold text-muted-foreground">
            Account Email (Managed by Auth)
          </label>
          <Input
            value={profile.email}
            disabled
            className="bg-surface-muted text-muted-foreground cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
