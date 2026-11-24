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
import { Save, Loader2, Mail, User, AtSign, Phone, Globe } from "lucide-react"

const COUNTRY_CODES = [
  { code: "+92", label: "🇵🇰 Pakistan (+92)" },
  { code: "+1", label: "🇺🇸 USA/Canada (+1)" },
  { code: "+44", label: "🇬🇧 UK (+44)" },
  { code: "+91", label: "🇮🇳 India (+91)" },
  { code: "+971", label: "🇦🇪 UAE (+971)" },
  { code: "+966", label: "🇸🇦 Saudi Arabia (+966)" },
  { code: "+61", label: "🇦🇺 Australia (+61)" },
  { code: "+49", label: "🇩🇪 Germany (+49)" },
]

interface ProfileFormProps {
  profile: {
    id: string
    full_name: string
    username?: string | null
    phone?: string | null
    country_code?: string | null
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
      username: profile.username || "",
      country_code: profile.country_code || "+92",
      phone: profile.phone || "",
      avatar_url: profile.avatar_url || "",
    },
  })

  const avatarUrlWatch = watch("avatar_url")
  const fullNameWatch = watch("full_name")
  const usernameWatch = watch("username")

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          username: data.username || null,
          country_code: data.country_code || "+92",
          phone: data.phone || null,
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
      {/* Avatar & Header Preview */}
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
          {usernameWatch && (
            <p className="text-xs text-primary font-medium flex items-center gap-1">
              @{usernameWatch}
            </p>
          )}
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            {profile.email}
          </p>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-4 p-6 rounded-2xl bg-surface border border-border shadow-soft">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name (Alphabets Only, No Numbers) */}
          <div className="space-y-1.5">
            <label htmlFor="full_name" className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                Full Name
              </span>
              <span className="text-[10px] font-normal text-muted-foreground">(alphabets only)</span>
            </label>
            <Input
              id="full_name"
              placeholder="Ayesha Khan"
              {...register("full_name", {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/[0-9]/g, "")
                },
              })}
              className={errors.full_name ? "border-destructive focus-visible:border-destructive" : ""}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          {/* Username (Separate - Letters Only, No Numbers) */}
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-primary" />
                Username
              </span>
              <span className="text-[10px] font-normal text-muted-foreground">(letters only, no numbers)</span>
            </label>
            <Input
              id="username"
              placeholder="ayeshakhan"
              {...register("username", {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/[0-9]/g, "")
                },
              })}
              className={errors.username ? "border-destructive focus-visible:border-destructive" : ""}
            />
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username.message}</p>
            )}
          </div>
        </div>

        {/* Phone Number with Country Code (11 Digits) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-primary" />
            Phone Number <span className="text-[11px] font-normal text-muted-foreground">(11 digits)</span>
          </label>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-5 sm:col-span-4 relative">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <select
                id="country_code"
                {...register("country_code")}
                className="w-full h-10 pl-8 pr-2 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-7 sm:col-span-8">
              <Input
                id="phone"
                type="tel"
                maxLength={11}
                placeholder="03001234567"
                {...register("phone")}
                className={errors.phone ? "border-destructive focus-visible:border-destructive" : ""}
              />
            </div>
          </div>
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* Avatar URL */}
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

        {/* Readonly Email */}
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
