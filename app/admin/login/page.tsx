"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ShieldAlert, ShieldCheck, Lock, Mail, Loader2, ArrowRight } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError || !authData.user) {
        throw new Error("Invalid administrative credentials.")
      }

      // 2. Strict Role Verification: Ensure role is 'admin'
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single()

      if (profileError || !profile || profile.role !== "admin") {
        // Sign out immediately if authenticated user is not an administrator
        await supabase.auth.signOut()
        throw new Error("Access Denied: Your account does not possess administrator clearance.")
      }

      toast.success("Administrator clearance granted. Welcome to Control Center.")
      router.push("/admin")
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Secure Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-950/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-8 space-y-2 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <Image src="/logo.svg" alt="Eventify Logo" width={28} height={28} />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">
            Event<span className="text-indigo-400">ify</span>
            <span className="ml-2 text-xs font-mono uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Admin Gateway
            </span>
          </span>
        </Link>
      </div>

      {/* Separate Admin Login Card */}
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-rose-500/20 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-400 mb-2">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Administrative Clearance
          </h1>
          <p className="text-xs text-slate-400">
            Restricted entry. Authorized staff only. All actions are logged.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-rose-400" />
              Administrator Email
            </label>
            <Input
              id="admin-email"
              type="email"
              required
              placeholder="admin@eventify.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:ring-rose-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              Security Key / Password
            </label>
            <Input
              id="admin-password"
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:ring-rose-500/50"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-rose-600 hover:bg-rose-500 text-white font-semibold gap-2 border-0 shadow-lg shadow-rose-900/30 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Clearance...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Authenticate Administrator
              </>
            )}
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  )
}
