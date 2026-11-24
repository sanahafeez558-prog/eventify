"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import {
  LayoutDashboard,
  CalendarCheck,
  PlusCircle,
  CalendarDays,
  User,
  LogOut,
  ArrowLeft,
  Shield,
} from "lucide-react"

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function checkRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profile?.role === "admin") {
          setIsAdmin(true)
        }
      }
    }
    checkRole()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  // Base items visible to all authenticated users
  const baseNavItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/events", label: "My Registrations", icon: CalendarCheck },
    { href: "/dashboard/create-event", label: "Create Event", icon: PlusCircle },
    { href: "/dashboard/manage-events", label: "Manage Events", icon: CalendarDays },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ]

  // Add Admin Panel link ONLY if the user is confirmed to be an Admin
  const sidebarNavItems = isAdmin
    ? [...baseNavItems, { href: "/admin", label: "Admin Panel", icon: Shield }]
    : baseNavItems

  return (
    <aside className="w-full lg:w-64 bg-slate-950/80 border-r border-slate-800 flex flex-col shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 hidden lg:flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="Eventify Logo" width={28} height={28} />
          <span className="font-bold text-lg tracking-tight text-white">
            Event<span className="gradient-text-primary">ify</span>
          </span>
        </Link>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-500/30">
          Portal
        </span>
      </div>

      {/* Navigation Links */}
      <div className="p-3 lg:p-4 flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 scrollbar-none flex-1">
        {sidebarNavItems.map((item) => {
          const isActive = pathname === item.href
          const isAdminItem = item.href === "/admin"
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 ${
                isActive
                  ? isAdminItem
                    ? "bg-purple-600 text-white shadow-glow font-semibold"
                    : "bg-indigo-600 text-white shadow-glow font-semibold"
                  : isAdminItem
                  ? "text-purple-400 hover:bg-purple-950/50 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : isAdminItem ? "text-purple-400" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Bottom Pinned Actions */}
      <div className="p-4 border-t border-slate-800 hidden lg:flex flex-col gap-2">
        <Button variant="ghost" size="sm" asChild className="justify-start gap-2 text-slate-400 hover:text-white hover:bg-slate-900">
          <Link href="/events">
            <ArrowLeft className="w-4 h-4" />
            Back to Public Directory
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="justify-start gap-2 text-destructive hover:bg-rose-950/50 hover:text-destructive border-slate-800"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
