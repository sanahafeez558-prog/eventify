import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { AccessibilityProvider } from "@/components/providers/accessibility-provider"
import { CookieConsentModal } from "@/components/layout/cookie-consent-modal"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Eventify — Discover. Connect. Experience.",
    template: "%s — Eventify",
  },
  description:
    "A modern, full-featured event management and discovery platform for campus communities, workshops, and networking meetups.",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <AccessibilityProvider>
          {children}
          {/* Elfsight AI Chatbot | Untitled AI Chatbot */}
          <Script
            src="https://elfsightcdn.com/platform.js"
            strategy="afterInteractive"
          />
          <div
            className="elfsight-app-f7beec2e-b71e-4474-8c34-bf78d747cd2a"
            data-elfsight-app-lazy
          />
          {/* Cookie Consent Interface */}
          <CookieConsentModal />
          <Toaster position="top-right" />
        </AccessibilityProvider>
      </body>
    </html>
  )
}
