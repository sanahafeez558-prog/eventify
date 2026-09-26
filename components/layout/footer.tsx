import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-surface-muted/80 text-foreground pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-border/60">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo.svg" alt="Eventify Logo" width={32} height={32} />
              <span className="font-bold text-xl tracking-tight text-foreground">
                Event<span className="text-primary">ify</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover. Connect. Experience.
              <br />
              The unified event platform for campus communities, workshops, and networking meetups.
            </p>
          </div>

          {/* Explore Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/events" className="hover:text-primary transition-colors">
                  All Events
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/events?filter=upcoming" className="hover:text-primary transition-colors">
                  Upcoming This Week
                </Link>
              </li>
            </ul>
          </div>

          {/* Organizers */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Organizers
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard/create-event" className="hover:text-primary transition-colors">
                  Host an Event
                </Link>
              </li>
              <li>
                <Link href="/dashboard/manage-events" className="hover:text-primary transition-colors">
                  Manage RSVPs
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  Organizer Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Eventify
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <span className="text-xs text-muted-foreground/80">
                  Postgres + RLS Secured
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Eventify. Built for BS IT Web Engineering capstone.</p>
          <p className="text-muted-foreground/80">
            Powered by Next.js & Supabase
          </p>
        </div>
      </div>
    </footer>
  )
}
