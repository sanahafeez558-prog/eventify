import Link from "next/link"
import Image from "next/image"
import { Mail, MapPin, ShieldCheck, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950/90 text-slate-300 pt-12 pb-8 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-10 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="space-y-3.5 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src="/logo.svg" alt="Eventify Logo" width={30} height={30} className="brightness-200 invert-0" />
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Event<span className="gradient-text-primary">ify</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Discover. Connect. Experience.
              <br />
              The unified event platform for campus communities, workshops, tech meetups, and networking events.
            </p>
            <div className="pt-1 text-xs text-slate-400 space-y-1">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Campus Innovation Center, Block B, University Ave</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <a href="mailto:support@eventify.com" className="hover:text-indigo-300 transition-colors">
                  support@eventify.com
                </a>
              </p>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-indigo-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-indigo-400 transition-colors">
                  All Events
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-indigo-400 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-indigo-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-400 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Organizers & Action */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Organizers
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/dashboard/create-event" className="hover:text-indigo-400 transition-colors">
                  Host an Event
                </Link>
              </li>
              <li>
                <Link href="/dashboard/manage-events" className="hover:text-indigo-400 transition-colors">
                  Manage RSVPs
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">
                  Attendee Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-rose-400 transition-colors font-medium">
                  Admin Gateway
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Legal & Trust
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/privacy" className="hover:text-indigo-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-indigo-400 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                TLS 1.3 & RLS Protected
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Eventify. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <span>•</span>
            <Link href="/cookies" className="hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
