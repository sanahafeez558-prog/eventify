"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema, type SignupFormData } from "@/lib/validations/auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter"
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons"
import { toast } from "sonner"
import {
  UserPlus,
  Loader2,
  User,
  AtSign,
  Mail,
  Phone,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react"

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

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      country_code: "+92",
      phone: "",
    },
  })

  const passwordWatch = watch("password") || ""

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true)
    try {
      // 1. Check duplicate username in profiles before signup
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", data.username.trim())
        .maybeSingle()

      if (existingUser) {
        toast.error("This username is already taken. Please choose another username.")
        setLoading(false)
        return
      }

      // 2. Perform Supabase Sign Up
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            full_name: data.full_name.trim(),
            username: data.username.trim(),
            phone: data.phone,
            country_code: data.country_code,
          },
        },
      })

      if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
          throw new Error("This email is already registered. Please sign in instead.")
        }
        throw error
      }

      if (authData.session) {
        toast.success("Account created successfully! Welcome to Eventify.")
        router.push("/dashboard")
        router.refresh()
      } else {
        toast.success("Signup successful! Please check your Gmail to confirm your account.")
        router.push("/login")
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-background text-foreground">
      {/* Ambient Orbs */}
      <div className="absolute top-10 left-1/4 w-[550px] h-[550px] bg-indigo-600/30 blur-[130px] rounded-full pointer-events-none animate-blob-slow -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-purple-600/25 blur-[140px] rounded-full pointer-events-none animate-blob-reverse -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-cyan-600/18 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Brand Header */}
      <div className="text-center mb-6 space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-glow group-hover:scale-105 transition-transform">
            <Image src="/logo.svg" alt="Eventify Logo" width={32} height={32} className="brightness-200 invert-0" />
          </div>
          <span className="font-extrabold text-3xl tracking-tight text-white">
            Event<span className="gradient-text-primary">ify</span>
          </span>
        </Link>
        <p className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          Discover. Connect. Experience.
        </p>
      </div>

      {/* Signup Glassmorphic Form Card */}
      <div className="w-full max-w-lg p-6 sm:p-10 rounded-3xl glass-card border border-indigo-500/25 shadow-2xl space-y-5">
        <div className="space-y-1 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 mb-2 shadow-inner">
            <UserPlus className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create an Account
          </h1>
          <p className="text-xs text-slate-400">
            Join to attend campus events & host your own workshops
          </p>
        </div>

        {/* Social Auth Providers */}
        <SocialAuthButtons redirectTo="/dashboard" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 1. Name & Strict Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="full_name" className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  Full Name
                </span>
                <span className="text-[10px] font-normal text-indigo-400/80">(alphabets only)</span>
              </label>
              <Input
                id="full_name"
                placeholder="Ayesha Khan"
                autoComplete="name"
                {...register("full_name", {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, "")
                  },
                })}
                className={`bg-slate-950/80 text-slate-100 placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-indigo-500/50 ${
                  errors.full_name ? "border-destructive focus-visible:border-destructive" : "border-slate-800"
                }`}
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            {/* Username (STRICT: ONLY Alphabets A-Z and a-z, 4-22 chars) */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <AtSign className="w-3.5 h-3.5 text-purple-400" />
                  Username
                </span>
                <span className="text-[10px] font-normal text-purple-400/80">(4-22 letters only)</span>
              </label>
              <Input
                id="username"
                placeholder="ayeshakhan"
                maxLength={22}
                autoComplete="username"
                {...register("username", {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "")
                  },
                })}
                className={`bg-slate-950/80 text-slate-100 placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-purple-500/50 ${
                  errors.username ? "border-destructive focus-visible:border-destructive" : "border-slate-800"
                }`}
              />
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username.message}</p>
              )}
            </div>
          </div>

          {/* Email / Gmail with @ */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                Gmail Address
              </span>
              <span className="text-[10px] font-normal text-indigo-400/80">(must include @gmail.com)</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder="ayesha@gmail.com"
              autoComplete="email"
              {...register("email")}
              className={`bg-slate-950/80 text-slate-100 placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-indigo-500/50 ${
                errors.email ? "border-destructive focus-visible:border-destructive" : "border-slate-800"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              Phone Number <span className="text-[11px] font-normal text-slate-400">(11 digits)</span>
            </label>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5 sm:col-span-4 relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <select
                  id="country_code"
                  {...register("country_code")}
                  className="w-full h-10 pl-8 pr-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors shadow-sm"
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
                  autoComplete="tel"
                  {...register("phone")}
                  className={`bg-slate-950/80 text-slate-100 placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-cyan-500/50 ${
                    errors.phone ? "border-destructive focus-visible:border-destructive" : "border-slate-800"
                  }`}
                />
              </div>
            </div>
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* Password with Show/Hide & Live Strength Meter */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("password")}
                className={`pr-10 bg-slate-950/80 text-slate-100 placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-purple-500/50 ${
                  errors.password ? "border-destructive focus-visible:border-destructive" : "border-slate-800"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors p-1"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-purple-400" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}

            {/* LIVE PASSWORD STRENGTH METER (4 STRICT RULES) */}
            <PasswordStrengthMeter password={passwordWatch} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className={`pr-10 bg-slate-950/80 text-slate-100 placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-purple-500/50 ${
                  errors.confirmPassword ? "border-destructive focus-visible:border-destructive" : "border-slate-800"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors p-1"
                title={showConfirmPassword ? "Hide password" : "Show password"}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4 text-purple-400" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 gap-2 mt-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold shadow-glow border-0 transition-all duration-200 hover:scale-[1.01]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Sign Up
              </>
            )}
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 font-semibold hover:text-purple-300 hover:underline transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
