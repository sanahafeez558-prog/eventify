import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Badge } from "@/components/ui/badge"
import { ContactForm } from "@/components/contact/contact-form"
import { Mail, MessageSquare, MapPin } from "lucide-react"

export const metadata = {
  title: "Contact Us — Eventify",
  description: "Get in touch with the Eventify team for support, partnership inquiries, or general feedback.",
}

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Info */}
          <div className="lg:col-span-5 space-y-6">
            <Badge variant="accent">Support & Inquiries</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              We&apos;d love to hear from you
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Have questions about organizing an event on campus, reporting an issue, or sharing suggestions? Drop us a note and we&apos;ll be happy to help.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-surface border border-border shadow-soft">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Email Inquiries</h4>
                  <p className="text-xs text-muted-foreground">support@eventify.university.edu</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-surface border border-border shadow-soft">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Community Chat</h4>
                  <p className="text-xs text-muted-foreground">Campus tech club & organizer Discord</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-surface border border-border shadow-soft">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Location</h4>
                  <p className="text-xs text-muted-foreground">BS IT Web Engineering Lab, Main Campus</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-2xl bg-surface border border-border shadow-medium">
              <h2 className="text-xl font-semibold text-foreground mb-2">Send a Message</h2>
              <p className="text-xs text-muted-foreground mb-6">
                All messages are recorded directly into the platform database.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
