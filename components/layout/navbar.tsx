"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import {
  Menu,
  X,
  Calendar,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Compass,
} from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Get initial auth user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    const handleScroll = () => {
      setScrolled(window.scrollY > 8)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      subscription.unsubscribe()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const navLinks = [
    { href: "/events", label: "Explore Events", icon: Compass },
    { href: "/categories", label: "Categories", icon: Calendar },
    { href: "/about", label: "About", icon: null },
    { href: "/contact", label: "Contact", icon: null },
  ]

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-border/80 shadow-soft"
          : "bg-white/50 backdrop-blur-sm border-b border-border/40"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.svg"
            alt="Eventify Logo"
            width={32}
            height={32}
            className="transition-transform group-hover:scale-105"
          />
          <span className="font-bold text-xl tracking-tight text-foreground">
            Event<span className="text-primary">ify</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard" className="gap-2">
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  Dashboard
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard/create-event" className="gap-1.5">
                  <PlusCircle className="w-4 h-4" />
                  Host Event
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-1.5 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg text-foreground hover:bg-surface-muted transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface px-4 py-5 shadow-medium animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium ${
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-surface-muted"
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-border flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-foreground hover:bg-surface-muted"
                  >
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/create-event"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-primary bg-primary/10"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Host Event
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleSignOut()
                    }}
                    className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-destructive hover:bg-rose-50 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button variant="outline" asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
