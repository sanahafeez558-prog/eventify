import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Account — Eventify",
  description: "Sign up for an Eventify account to attend events and connect with campus communities.",
  icons: {
    icon: "/logo.svg",
  },
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
