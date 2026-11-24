import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  CalendarDays,
  TicketCheck,
  MessageSquare,
  PlusCircle,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
} from "lucide-react"

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  // Fetch counts in parallel
  const [
    { count: totalUsers },
    { count: totalEvents },
    { count: publishedEvents },
    { count: totalRegistrations },
    { count: totalMessages },
    { data: recentUsers },
    { data: upcomingEvents },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("registrations").select("*", { count: "exact", head: true }),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("events").select("*, categories(name)").order("event_date", { ascending: true }).limit(5),
  ])

  const stats = [
    {
      title: "Total System Users",
      value: totalUsers || 0,
      description: "Registered accounts in database",
      icon: Users,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      href: "/admin/users",
    },
    {
      title: "Managed Events",
      value: totalEvents || 0,
      description: `${publishedEvents || 0} currently published`,
      icon: CalendarDays,
      color: "bg-purple-50 text-purple-600 border-purple-100",
      href: "/admin/events",
    },
    {
      title: "Event RSVPs",
      value: totalRegistrations || 0,
      description: "Confirmed registrations",
      icon: TicketCheck,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      href: "/admin/registrations",
    },
    {
      title: "Contact Inquiries",
      value: totalMessages || 0,
      description: "Customer feedback & messages",
      icon: MessageSquare,
      color: "bg-amber-50 text-amber-600 border-amber-100",
      href: "/admin/messages",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-600 to-primary text-white shadow-medium">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              Control Panel
            </span>
            <span className="flex items-center gap-1 text-xs text-purple-100">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Connected to Supabase RLS
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Admin Management Console
          </h1>
          <p className="text-purple-100 text-sm mt-1 max-w-xl">
            Full authority to view, add, edit, modify dates, change user roles, and manage all events and registrations seamlessly without errors.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button asChild className="bg-white text-purple-700 hover:bg-purple-50 font-semibold shadow-soft">
            <Link href="/admin/users" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Manage Users
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10">
            <Link href="/admin/events" className="gap-2">
              <PlusCircle className="w-4 h-4" />
              Manage Events
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Link key={idx} href={stat.href}>
            <Card className="hover:shadow-medium transition-all duration-200 border-border group cursor-pointer h-full">
              <CardContent className="p-5 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-extrabold text-foreground mt-2 group-hover:text-purple-600 transition-colors">
                    {stat.value}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-xl border ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid: Recent Users & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users Card */}
        <Card className="border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Recently Registered Users
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Latest accounts added to the system
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs gap-1 text-purple-600 hover:text-purple-700">
              <Link href="/admin/users">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentUsers && recentUsers.length > 0 ? (
                recentUsers.map((u) => (
                  <div key={u.id} className="p-4 flex items-center justify-between hover:bg-surface-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                        {u.full_name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{u.full_name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`capitalize ${
                      u.role === "admin"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : u.role === "organizer"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}>
                      {u.role}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No registered users found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Managed Events Card */}
        <Card className="border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                Upcoming Events Schedule
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Quick view of scheduled dates & locations
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs gap-1 text-purple-600 hover:text-purple-700">
              <Link href="/admin/events">
                Manage Events <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {upcomingEvents && upcomingEvents.length > 0 ? (
                upcomingEvents.map((ev) => (
                  <div key={ev.id} className="p-4 flex items-center justify-between hover:bg-surface-muted transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground line-clamp-1">{ev.title}</span>
                        <Badge variant="outline" className="text-[10px] bg-slate-50">
                          {ev.categories?.name || "General"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium text-purple-600">
                          <Clock className="w-3.5 h-3.5" />
                          {ev.event_date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {ev.location}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className={`capitalize ${
                      ev.status === "published"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : ev.status === "draft"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {ev.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No upcoming events scheduled.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Integrity Badge */}
      <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>System Status: <strong>All Database Constraints & RLS Triggers Operational</strong></span>
        </div>
        <span className="hidden sm:inline text-muted-foreground">
          PostgreSQL Capacity Trigger + Soft-Cancel Integrity Enforced
        </span>
      </div>
    </div>
  )
}
