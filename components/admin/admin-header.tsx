"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Shield,
  ShieldCheck,
  User,
  LayoutDashboard,
  Users,
  CalendarDays,
  TicketCheck,
  MessageSquare,
  Menu,
  X,
  RefreshCw,
} from "lucide-react"

export function AdminHeader() {
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string>("")
  const [role, setRole] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserEmail(user.email || "")
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
      if (profile) setRole(profile.role)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const toggleAdminRole = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const newRole = role === "admin" ? "attendee" : "admin"
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", user.id)

      if (error) throw error

      setRole(newRole)
      toast.success(`Role updated to "${newRole}". Admin privileges active!`)
    } catch (err: any) {
      toast.error(err.message || "Failed to update role")
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="bg-surface border-b border-border px-4 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-1.5 rounded-lg border border-border text-foreground hover:bg-surface-muted"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-none">
              System Administration
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Eventify Management Console
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {userEmail && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-muted border border-border text-xs">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">{userEmail}</span>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 capitalize">
              {role || "admin"}
            </Badge>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={toggleAdminRole}
          disabled={loading}
          className="text-xs gap-1.5 border-purple-200 text-purple-700 hover:bg-purple-50"
          title="Toggle Admin Privilege for testing"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {role === "admin" ? "Admin Mode Active" : "Promote to Admin"}
        </Button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-surface border-b border-border p-4 shadow-medium flex flex-col gap-2">
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
              pathname === "/admin" ? "bg-purple-600 text-white font-medium" : "text-foreground"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </Link>
          <Link
            href="/admin/users"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
              pathname === "/admin/users" ? "bg-purple-600 text-white font-medium" : "text-foreground"
            }`}
          >
            <Users className="w-4 h-4" />
            Manage Users
          </Link>
          <Link
            href="/admin/events"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
              pathname === "/admin/events" ? "bg-purple-600 text-white font-medium" : "text-foreground"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Manage Events
          </Link>
          <Link
            href="/admin/registrations"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
              pathname === "/admin/registrations" ? "bg-purple-600 text-white font-medium" : "text-foreground"
            }`}
          >
            <TicketCheck className="w-4 h-4" />
            Manage RSVPs
          </Link>
          <Link
            href="/admin/messages"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
              pathname === "/admin/messages" ? "bg-purple-600 text-white font-medium" : "text-foreground"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Contact Messages
          </Link>
        </div>
      )}
    </header>
  )
}
