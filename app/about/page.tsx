import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Sparkles, Users, Calendar, ArrowRight, Lock } from "lucide-react"

export const metadata = {
  title: "About Eventify — Discover. Connect. Experience.",
  description: "Learn more about Eventify, our mission, architecture, and technology stack.",
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto w-full space-y-20">
        {/* Intro Hero */}
        <div className="max-w-3xl space-y-6">
          <Badge variant="accent" className="gap-1.5 py-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Mission</span>
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Connecting Communities Through Meaningful Events
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            University clubs and local communities often struggle with scattered communication across group chats and spreadsheets. Eventify provides a centralized, trustworthy platform where attendees discover happenings in seconds and organizers manage RSVPs effortlessly.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-surface border border-border shadow-soft space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Effortless Discovery</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Clean filtering by category, date, and location. Live seat availability indicators give attendees instant clarity on open spots.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-surface border border-border shadow-soft space-y-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Blended User Roles</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every signed-in account can both attend and organize events. No administrative bureaucracy—host a workshop or meetup in two minutes.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-surface border border-border shadow-soft space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">True Database Security</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enforced at the database level with PostgreSQL Row Level Security (RLS) policies. Capacity limits and registration integrity are strictly guaranteed.
            </p>
          </div>
        </div>

        {/* Architecture & Capstone Info Box */}
        <div className="glass-panel p-8 md:p-12 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <Badge variant="default">Engineering Standard</Badge>
              <h2 className="text-2xl font-bold text-foreground">Built to SaaS Quality</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>BS IT Web Engineering Capstone</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            Eventify is engineered using Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, and Supabase. Rather than relying on mock data or insecure client-only authorization, all authentication and relational constraints live directly within PostgreSQL.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/events" className="gap-2">
                Explore All Events
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
