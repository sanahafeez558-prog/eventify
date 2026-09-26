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
import { toast } from "sonner"
import { UserPlus, Loader2 } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true)
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
          },
        },
      })

      if (error) {
        throw error
      }

      if (authData.session) {
        toast.success("Account created successfully! Welcome to Eventify.")
        router.push("/dashboard")
        router.refresh()
      } else {
        toast.success("Signup successful! Please check your email to confirm your account.")
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

      {/* Signup Form Card */}
      <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-surface border border-border shadow-medium space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create an Account</h1>
          <p className="text-xs text-muted-foreground">
            Join to attend campus events and host your own workshops
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="full_name" className="text-xs font-semibold text-foreground">
              Full Name
            </label>
            <Input
              id="full_name"
              placeholder="Ayesha Khan"
              autoComplete="name"
              {...register("full_name")}
              className={errors.full_name ? "border-destructive focus-visible:border-destructive" : ""}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

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
            <label htmlFor="password" className="text-xs font-semibold text-foreground">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("password")}
              className={errors.password ? "border-destructive focus-visible:border-destructive" : ""}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-destructive focus-visible:border-destructive" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 gap-2 mt-2 shadow-soft">
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

        <div className="text-center pt-2 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
