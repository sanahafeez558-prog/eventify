import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us — Eventify",
  description: "Get in touch with the Eventify team.",
  icons: {
    icon: "/logo.svg",
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
