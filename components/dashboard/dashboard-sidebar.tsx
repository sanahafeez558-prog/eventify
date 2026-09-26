"use client"

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
} from "lucide-react"

const sidebarNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/events", label: "My Registrations", icon: CalendarCheck },
  { href: "/dashboard/create-event", label: "Create Event", icon: PlusCircle },
  { href: "/dashboard/manage-events", label: "Manage Events", icon: CalendarDays },
  { href: "/dashboard/profile", label: "Profile", icon: User },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <aside className="w-full lg:w-64 bg-surface border-r border-border flex flex-col shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-border hidden lg:flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="Eventify Logo" width={28} height={28} />
          <span className="font-bold text-lg tracking-tight text-foreground">
            Event<span className="text-primary">ify</span>
          </span>
        </Link>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
          Portal
        </span>
      </div>

      {/* Navigation Links */}
      <div className="p-3 lg:p-4 flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 scrollbar-none flex-1">
        {sidebarNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 ${
                isActive
                  ? "bg-primary text-white shadow-soft font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-muted"
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-muted-foreground"}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Bottom Pinned Actions */}
      <div className="p-4 border-t border-border hidden lg:flex flex-col gap-2">
        <Button variant="ghost" size="sm" asChild className="justify-start gap-2 text-muted-foreground hover:text-foreground">
          <Link href="/events">
            <ArrowLeft className="w-4 h-4" />
            Back to Public Directory
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="justify-start gap-2 text-destructive hover:bg-rose-50 hover:text-destructive border-border"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
