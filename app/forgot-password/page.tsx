"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Mail, KeyRound, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true)
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const { error } = await supabase.auth.resetPasswordForEmail(data.email.trim(), {
        redirectTo: `${origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      setSubmitted(true)
      toast.success("Password reset link sent to your email!")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset link"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-background text-foreground">
      {/* Ambient Orbs */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-indigo-600/25 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-purple-600/20 blur-[140px] rounded-full pointer-events-none -z-10" />

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

      <div className="w-full max-w-md p-6 sm:p-10 rounded-3xl glass-card border border-indigo-500/25 shadow-2xl space-y-6">
        <div className="space-y-1 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 mb-2 shadow-inner">
            <KeyRound className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Reset Password
          </h1>
          <p className="text-xs text-slate-400">
            Enter your registered Gmail to receive a secure recovery link
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-semibold text-emerald-200">Check Your Inbox</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We have dispatched a secure password reset link to your email address. Follow the link to choose a new password.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                Gmail Address
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 gap-2 mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold shadow-glow border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Link...
                </>
              ) : (
                "Send Reset Instructions"
              )}
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
