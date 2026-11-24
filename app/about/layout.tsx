import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us — Eventify",
  description: "Learn more about Eventify campus platform.",
  icons: {
    icon: "/logo.svg",
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
