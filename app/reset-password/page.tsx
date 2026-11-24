"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter"
import { toast } from "sonner"
import { Lock, Eye, EyeOff, Loader2, KeyRound } from "lucide-react"

export default function ResetPasswordPage() {
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
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const passwordWatch = watch("password") || ""

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        throw error
      }

      toast.success("Password updated successfully! Please sign in with your new password.")
      router.push("/login")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reset password"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-background text-foreground">
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
      </div>

      <div className="w-full max-w-md p-6 sm:p-10 rounded-3xl glass-card border border-indigo-500/25 shadow-2xl space-y-5">
        <div className="space-y-1 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 mb-2 shadow-inner">
            <KeyRound className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Set New Password
          </h1>
          <p className="text-xs text-slate-400">
            Create a secure password meeting all 4 strict criteria
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              New Password
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
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-purple-400" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}

            {/* Live Password Strength Meter */}
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
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4 text-purple-400" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 gap-2 mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold shadow-glow border-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
