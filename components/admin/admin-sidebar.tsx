"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  CalendarDays,
  TicketCheck,
  MessageSquare,
  Layers,
  ArrowLeft,
  LogOut,
  ShieldCheck,
} from "lucide-react"

const adminNavItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/categories", label: "Manage Categories", icon: Layers },
  { href: "/admin/events", label: "Manage Events", icon: CalendarDays },
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/registrations", label: "Manage RSVPs", icon: TicketCheck },
  { href: "/admin/messages", label: "Contact Messages", icon: MessageSquare },
  { href: "/admin/audit-logs", label: "Audit & Security Logs", icon: ShieldAlert },
]

export function AdminSidebar() {
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
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
          <ShieldCheck className="w-3 h-3 text-purple-600" />
          Admin
        </span>
      </div>

      {/* Admin Navigation Links */}
      <div className="p-3 lg:p-4 flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 scrollbar-none flex-1">
        <div className="hidden lg:block px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Management Controls
        </div>
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 ${
                isActive
                  ? "bg-purple-600 text-white shadow-soft font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-muted"
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-muted-foreground"}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Pinned Links at Bottom */}
      <div className="p-4 border-t border-border hidden lg:flex flex-col gap-2">
        <Button variant="ghost" size="sm" asChild className="justify-start gap-2 text-muted-foreground hover:text-foreground">
          <Link href="/dashboard">
            <LayoutDashboard className="w-4 h-4 text-primary" />
            User Dashboard
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="justify-start gap-2 text-muted-foreground hover:text-foreground">
          <Link href="/events">
            <ArrowLeft className="w-4 h-4" />
            Public Directory
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
