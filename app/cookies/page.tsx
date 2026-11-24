import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Cookie, CheckCircle2, ShieldCheck } from "lucide-react"

export const metadata = {
  title: "Cookie Policy — Eventify",
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Cookie className="w-4 h-4" /> Cookie Management
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Cookie Policy</h1>
          <p className="text-xs text-slate-400">Compliance with GDPR, ePrivacy, and Security Standards</p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-sm leading-relaxed glass-card p-8 rounded-3xl border border-slate-800">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 1. Essential Authentication Cookies
            </h2>
            <p>
              Eventify uses secure, HttpOnly session cookies solely to maintain your authenticated login session across requests. These cookies are strictly necessary for core functionality (account access, RSVP verification, organizer control).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" /> 2. Accessibility & Preference Storage
            </h2>
            <p>
              We store your selected theme (Dark Mode / Light Mode) and font scaling size (A- / A / A+) in local storage to deliver an accessible experience on every visit.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
