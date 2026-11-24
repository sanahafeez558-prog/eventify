import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In — Eventify",
  description: "Sign in to your Eventify account to discover and host events.",
  icons: {
    icon: "/logo.svg",
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
