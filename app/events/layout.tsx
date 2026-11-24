import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Browse Events — Eventify",
  description: "Explore upcoming workshops, conferences, and campus meetups.",
  icons: {
    icon: "/logo.svg",
  },
}

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
