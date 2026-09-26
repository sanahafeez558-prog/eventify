import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import {
  Laptop,
  Briefcase,
  GraduationCap,
  Users,
  Wrench,
  Film,
  Trophy,
  Heart,
  HelpCircle,
  ArrowRight,
} from "lucide-react"

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

export const metadata = {
  title: "Categories — Eventify",
  description: "Browse events by category: Technology, Business, Workshops, Networking, and more.",
}

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from("categories")
    .select("*, events(count)")
    .order("name")

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-12 md:py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl mb-12 space-y-3">
          <Badge variant="accent">Event Topics</Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Explore Categories
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Find workshops, networking sessions, talks, and campus gatherings tailored to your interests and skills.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories && categories.length > 0 ? (
            categories.map((category) => {
              const Icon = (category.icon && iconMap[category.icon]) || HelpCircle
              const eventCount = (category.events as unknown as { count: number }[])?.[0]?.count ?? 0

              return (
                <Link
                  key={category.id}
                  href={`/events?category=${encodeURIComponent(category.name)}`}
                  className="flex flex-col justify-between p-6 rounded-2xl bg-surface border border-border shadow-soft hover:border-primary/50 hover:shadow-medium hover:-translate-y-1 transition-all duration-200 group"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {category.description || "Discover events and connect with community members."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {eventCount} {eventCount === 1 ? "event" : "events"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-primary font-medium group-hover:translate-x-0.5 transition-transform">
                      Browse
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No categories found.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
