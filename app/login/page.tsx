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
import { toast } from "sonner"
import { LogIn, Loader2, ArrowRight } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/dashboard"
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        throw error
      }

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-semibold text-foreground">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          placeholder="ayesha@university.edu"
          autoComplete="email"
          {...register("email")}
          className={errors.email ? "border-destructive focus-visible:border-destructive" : ""}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-semibold text-foreground">
            Password
          </label>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          {...register("password")}
          className={errors.password ? "border-destructive focus-visible:border-destructive" : ""}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full h-11 gap-2 mt-2 shadow-soft">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing In...
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            Sign In
          </>
        )}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-background">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-gradient-to-tr from-primary/10 via-accent/15 to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />

      {/* Brand Header */}
      <div className="text-center mb-8 space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <Image src="/logo.svg" alt="Eventify Logo" width={36} height={36} className="transition-transform group-hover:scale-105" />
          <span className="font-bold text-2xl tracking-tight text-foreground">
            Event<span className="text-primary">ify</span>
          </span>
        </Link>
        <p className="text-xs text-muted-foreground">Discover. Connect. Experience.</p>
      </div>

      {/* Login Form Card */}
      <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-surface border border-border shadow-medium space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</h1>
          <p className="text-xs text-muted-foreground">
            Sign in to manage your RSVPs and hosted events
          </p>
        </div>

        <Suspense fallback={<div className="py-8 text-center text-xs text-muted-foreground">Loading...</div>}>
          <LoginForm />
        </Suspense>

        <div className="text-center pt-2 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account yet?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
