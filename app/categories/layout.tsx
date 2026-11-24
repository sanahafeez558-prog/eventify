import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Categories — Eventify",
  description: "Browse events by category.",
  icons: {
    icon: "/logo.svg",
  },
}

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
