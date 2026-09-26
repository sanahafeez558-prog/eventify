import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import {
  Calendar,
  MapPin,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Laptop,
  Briefcase,
  GraduationCap,
  Wrench,
  Film,
  Trophy,
  Heart,
  HelpCircle,
} from "lucide-react"

// Icon resolver for dynamic categories
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Laptop,
  Briefcase,
  GraduationCap,
  Users,
  Wrench,
  Film,
  Trophy,
  Heart,
}

export default async function Home() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar Minimal Preview */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image src="/logo.svg" alt="Eventify Logo" width={32} height={32} className="transition-transform group-hover:scale-105" />
            <span className="font-bold text-xl tracking-tight text-foreground">
              Event<span className="text-primary">ify</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="success" className="hidden sm:inline-flex gap-1.5 py-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Database Connected</span>
            </Badge>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24 relative overflow-hidden">
        {/* Soft decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-primary/10 via-accent/15 to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover. Connect. Experience.</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
            Campus & Community Events,{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              All in One Place
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg leading-relaxed">
            The modern event management platform designed for student workshops, networking nights, and community meetups. Backed by live Postgres with row-level security.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button size="lg" className="shadow-medium gap-2">
              Browse Events
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg">
              Create an Event
            </Button>
          </div>
        </div>

        {/* Live Seeded Categories Preview from Supabase */}
        {categories && categories.length > 0 && (
          <div className="max-w-5xl mx-auto w-full mt-12">
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Explore Categories (Live from Supabase)
              </span>
              <span className="text-xs text-primary font-medium">{categories.length} Categories</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {categories.map((category) => {
                const IconComponent = (category.icon && iconMap[category.icon]) || HelpCircle
                return (
                  <div
                    key={category.id}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-surface border border-border shadow-soft hover:border-primary/40 hover:shadow-medium transition-all duration-150 text-center group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-foreground line-clamp-1">{category.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Design System Preview Grid */}
        <div className="max-w-5xl mx-auto w-full mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Sample Event Card */}
          <Card className="hover:shadow-medium transition-all duration-200">
            <div className="h-44 w-full bg-gradient-to-br from-primary/20 via-accent/20 to-surface-muted rounded-t-2xl relative p-4 flex items-end">
              <Badge variant="default" className="bg-white/90 backdrop-blur-sm text-foreground shadow-soft">
                Technology
              </Badge>
            </div>
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-lg">Full-Stack Next.js Workshop</CardTitle>
              <CardDescription className="line-clamp-2">
                Hands-on session building modern web applications with App Router, Supabase Auth, and real-time database capabilities.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2 text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Saturday, Oct 12 · 3:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Auditorium Hall B</span>
              </div>
            </CardContent>
            <CardFooter className="p-5 pt-0 flex items-center justify-between border-t border-border/60 mt-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <Users className="w-3.5 h-3.5" />
                <span>38 / 50 seats left</span>
              </div>
              <Button size="sm" variant="secondary">
                View Event
              </Button>
            </CardFooter>
          </Card>

          {/* Card 2: Glassmorphism Architecture Card */}
          <div className="glass-panel p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <Badge variant="accent">Stack & Architecture</Badge>
              <h3 className="text-xl font-semibold text-foreground">Integrated Foundations</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Clean separation with Next.js Server Components for data reads, Client Components for interactivity, and Supabase RLS policies for strict database security.
              </p>
              <ul className="text-xs text-foreground/80 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Next.js 16 (App Router + Turbopack)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Supabase Postgres (5 tables + RLS)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Automated GitHub & Vercel Sync
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-glass-border">
              <span className="text-xs font-medium text-muted-foreground">Status: Phase 1 Complete</span>
            </div>
          </div>

          {/* Card 3: UI Primitives & Design Tokens */}
          <Card className="p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">UI Tokens</span>
                <Badge variant="outline">shadcn/ui</Badge>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-foreground">Interactive Buttons</div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Primary</Button>
                  <Button size="sm" variant="secondary">Secondary</Button>
                  <Button size="sm" variant="outline">Outline</Button>
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <div className="text-xs font-medium text-foreground">Semantic Badges</div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="success">Confirmed</Badge>
                  <Badge variant="destructive">Sold Out</Badge>
                  <Badge variant="accent">Networking</Badge>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-border/60">
              <span className="text-xs text-muted-foreground">Light Glassmorphic Design System</span>
            </div>
          </Card>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-border/70 py-8 px-4 text-center text-xs text-muted-foreground bg-surface-muted">
        <p>© 2026 Eventify. Built for BS IT Web Engineering capstone.</p>
      </footer>
    </div>
  )
}
