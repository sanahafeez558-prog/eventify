import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Scale, CheckCircle2, AlertCircle } from "lucide-react"

export const metadata = {
  title: "Terms and Conditions — Eventify",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-400 text-xs font-semibold">
            <Scale className="w-4 h-4" /> Platform Agreement
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Terms and Conditions</h1>
          <p className="text-xs text-slate-400">Last updated: November 2026</p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-sm leading-relaxed glass-card p-8 rounded-3xl border border-slate-800">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using Eventify, you agree to comply with all applicable terms, community standards, and event guidelines. If you do not agree with any part of these terms, please discontinue using the platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-purple-400" /> 2. Event Hosting & RSVP Conduct
            </h2>
            <p>
              Organizers are responsible for providing truthful information regarding event timing, venue, and seat availability. Attendees must register only when planning to attend and cancel in advance if unable to join to release seats for other community members.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
