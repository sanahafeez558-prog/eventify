import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react"

export const metadata = {
  title: "Privacy Policy — Eventify",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" /> Legal Trust & Security
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Privacy Policy</h1>
          <p className="text-xs text-slate-400">Last updated: November 2026 • Effective immediately</p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-sm leading-relaxed glass-card p-8 rounded-3xl border border-slate-800">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> 1. Information We Collect
            </h2>
            <p>
              When you register on Eventify, we collect your full name, unique username, Gmail address, phone number, and account credentials. Passwords are encrypted and cryptographically hashed before storage. We also record RSVPs and workshop attendance to enforce capacity restrictions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" /> 2. Security & Database Encryption
            </h2>
            <p>
              All traffic between your browser and our servers is secured with HTTPS and TLS 1.3 encryption. Database queries are isolated using PostgreSQL Row-Level Security (RLS) policies and parameterized statements to prevent unauthorized cross-tenant data access and SQL injection.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-pink-400" /> 3. Data Protection & Sharing
            </h2>
            <p>
              We do not sell, rent, or monetize your personal information. Event organizers can only see names and usernames of registered attendees for check-in and seat verification purposes.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
