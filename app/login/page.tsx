"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginFormData } from "@/lib/validations/auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons"
import { toast } from "sonner"
import { LogIn, Loader2, User, Lock, Eye, EyeOff, Sparkles, ShieldCheck } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/dashboard"
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: true,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    if (isLocked) {
      toast.error("Account temporarily locked due to multiple failed attempts. Please wait 30 seconds.")
      return
    }

    setLoading(true)
    try {
      // 1. Resolve identifier (Username OR Gmail)
      const res = await fetch("/api/auth/resolve-identifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: data.identifier }),
      })

      if (res.status === 429) {
        setIsLocked(true)
        setTimeout(() => setIsLocked(false), 30000)
        throw new Error("Too many login attempts. Please wait 30 seconds before trying again.")
      }

      const resData = await res.json()
      const resolvedEmail = resData.email || data.identifier

      // 2. Perform Supabase password authentication
      const { error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password: data.password,
      })

      if (error) {
        const nextAttempts = failedAttempts + 1
        setFailedAttempts(nextAttempts)

        // Progressive brute-force delay
        if (nextAttempts >= 5) {
          setIsLocked(true)
          setTimeout(() => {
            setIsLocked(false)
            setFailedAttempts(0)
          }, 30000)
          throw new Error("Too many consecutive failed attempts. Locked for 30 seconds.")
        }

        // Generic error message to prevent account enumeration
        throw new Error("Invalid username/Gmail or password.")
      }

      // Successful login
      toast.success("Welcome back! Signed in successfully.")
      router.push(redirect)
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid credentials"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Social Logins */}
      <SocialAuthButtons redirectTo={redirect} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username or Gmail Field */}
        <div className="space-y-1.5">
          <label htmlFor="identifier" className="text-xs font-semibold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Username or Gmail
            </span>
            <span className="text-[10px] font-normal text-indigo-400/80">e.g. ayeshakhan or name@gmail.com</span>
          </label>
          <Input
            id="identifier"
            type="text"
            placeholder="Username or Gmail address"
            autoComplete="username"
            {...register("identifier")}
            className={`bg-slate-950/80 text-slate-100 placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-indigo-500/50 ${
              errors.identifier ? "border-destructive focus-visible:border-destructive" : "border-slate-800"
            }`}
          />
          {errors.identifier && (
            <p className="text-xs text-destructive">{errors.identifier.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-medium text-indigo-400 hover:text-purple-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
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
        </div>

        {/* Remember Me Option */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/40"
            />
            <span>Remember me</span>
          </label>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Secure SSL session
          </span>
        </div>

        <Button
          type="submit"
          disabled={loading || isLocked}
          className="w-full h-11 gap-2 mt-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold shadow-glow border-0 transition-all duration-200 hover:scale-[1.01]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing In...
            </>
          ) : isLocked ? (
            "Temporarily Locked (30s)"
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign In
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-background text-foreground">
      {/* Ambient Orbs */}
      <div className="absolute top-12 left-1/4 w-[500px] h-[500px] bg-indigo-600/30 blur-[120px] rounded-full pointer-events-none animate-blob-slow -z-10" />
      <div className="absolute bottom-12 right-1/4 w-[550px] h-[550px] bg-purple-600/25 blur-[130px] rounded-full pointer-events-none animate-blob-reverse -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-fuchsia-600/20 blur-[140px] rounded-full pointer-events-none -z-10" />

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

      {/* Login Glassmorphic Form Card */}
      <div className="w-full max-w-md p-6 sm:p-10 rounded-3xl glass-card border border-indigo-500/25 shadow-2xl space-y-5">
        <div className="space-y-1 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 mb-2 shadow-inner">
            <LogIn className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to access your event workspace & RSVPs
          </p>
        </div>

        <Suspense fallback={<div className="py-8 text-center text-xs text-slate-400">Loading...</div>}>
          <LoginForm />
        </Suspense>

        <div className="text-center pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Don&apos;t have an account yet?{" "}
            <Link href="/signup" className="text-indigo-400 font-semibold hover:text-purple-300 hover:underline transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
