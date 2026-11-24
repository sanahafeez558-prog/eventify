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
  Home,
  Calendar,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  Compass,
  Shield,
  Sparkles,
} from "lucide-react"
import { AccessibilityControls } from "@/components/providers/accessibility-provider"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Get initial auth user and check role
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profile?.role === "admin") {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
    }

    loadUser()

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .single()
        setIsAdmin(profile?.role === "admin")
      } else {
        setIsAdmin(false)
      }
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
    setUser(null)
    setIsAdmin(false)
    router.push("/")
    router.refresh()
  }

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/events", label: "Explore Events", icon: Compass },
    { href: "/categories", label: "Categories", icon: Calendar },
    { href: "/about", label: "About", icon: null },
    { href: "/contact", label: "Contact", icon: null },
  ]

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/90 backdrop-blur-xl border-b border-indigo-500/25 shadow-medium"
          : "bg-slate-950/70 backdrop-blur-md border-b border-indigo-500/15"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with Glowing Badge */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-glow group-hover:scale-105 transition-transform">
            <Image
              src="/logo.svg"
              alt="Eventify Logo"
              width={26}
              height={26}
              className="brightness-200 invert-0"
            />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Event<span className="gradient-text-primary">ify</span>
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
                className={`text-sm font-medium transition-all ${
                  isActive
                    ? "text-indigo-400 font-semibold"
                    : "text-slate-300 hover:text-indigo-400"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Controls: Accessibility & Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Universal Accessibility & Theme Controls */}
          <AccessibilityControls />
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="hover:bg-slate-900 text-slate-200">
                <Link href="/dashboard" className="gap-2">
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                  Dashboard
                </Link>
              </Button>
              {/* Render Admin button ONLY for confirmed Admins */}
              {isAdmin && (
                <Button variant="outline" size="sm" asChild className="border-purple-500/40 bg-purple-950/40 text-purple-300 hover:bg-purple-900/60">
                  <Link href="/admin" className="gap-1.5 font-semibold">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button size="sm" asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-glow border-0">
                <Link href="/dashboard/create-event" className="gap-1.5">
                  <PlusCircle className="w-4 h-4" />
                  Host Event
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-1.5 text-slate-400 hover:text-destructive border-slate-800"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hover:bg-slate-900 text-slate-200">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold shadow-glow border-0">
                <Link href="/signup" className="gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                  Get Started
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-xl text-slate-200 hover:bg-slate-900 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-indigo-400" /> : <Menu className="w-6 h-6 text-indigo-400" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-indigo-500/20 bg-slate-950/95 backdrop-blur-xl px-4 py-5 shadow-medium animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-medium ${
                  pathname === link.href
                    ? "bg-indigo-950 text-indigo-400"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4 text-indigo-400" />}
                {link.label}
              </Link>
            ))}

            <div className="pt-2 flex justify-center">
              <AccessibilityControls />
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-900"
                  >
                    <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-semibold text-purple-300 bg-purple-950/50 border border-purple-500/30"
                    >
                      <Shield className="w-4 h-4 text-purple-400" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/dashboard/create-event"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Host Event
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleSignOut()
                    }}
                    className="flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-medium text-destructive hover:bg-rose-950/50 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button variant="outline" asChild onClick={() => setMobileMenuOpen(false)} className="border-slate-800 text-slate-200">
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild onClick={() => setMobileMenuOpen(false)} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
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
