import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Portal — Eventify",
  description: "Separate administrative control panel for Eventify.",
  icons: {
    icon: "/logo.svg",
  },
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
