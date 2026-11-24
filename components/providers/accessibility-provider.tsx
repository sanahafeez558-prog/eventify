"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { Sun, Moon, RotateCcw } from "lucide-react"

type FontSize = "sm" | "md" | "lg" | "xl"
type Theme = "dark" | "light"

interface AccessibilityContextType {
  fontSize: FontSize
  theme: Theme
  increaseFontSize: () => void
  decreaseFontSize: () => void
  resetFontSize: () => void
  toggleTheme: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>("md")
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    // 1. Load persisted font size preference
    const savedSize = localStorage.getItem("eventify_font_size") as FontSize | null
    if (savedSize && ["sm", "md", "lg", "xl"].includes(savedSize)) {
      setFontSize(savedSize)
      applyFontSizeClass(savedSize)
    } else {
      applyFontSizeClass("md")
    }

    // 2. Load persisted theme preference
    const savedTheme = localStorage.getItem("eventify_theme") as Theme | null
    if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
      setTheme(savedTheme)
      applyThemeClass(savedTheme)
    } else {
      applyThemeClass("dark")
    }
  }, [])

  const applyFontSizeClass = (size: FontSize) => {
    const root = document.documentElement
    root.classList.remove("font-scale-sm", "font-scale-md", "font-scale-lg", "font-scale-xl")
    root.classList.add(`font-scale-${size}`)
  }

  const applyThemeClass = (th: Theme) => {
    const root = document.documentElement
    if (th === "light") {
      root.classList.add("light")
      root.classList.remove("dark")
    } else {
      root.classList.add("dark")
      root.classList.remove("light")
    }
  }

  const increaseFontSize = () => {
    setFontSize((prev) => {
      let next: FontSize = "lg"
      if (prev === "sm") next = "md"
      else if (prev === "md") next = "lg"
      else if (prev === "lg" || prev === "xl") next = "xl"
      localStorage.setItem("eventify_font_size", next)
      applyFontSizeClass(next)
      return next
    })
  }

  const decreaseFontSize = () => {
    setFontSize((prev) => {
      let next: FontSize = "sm"
      if (prev === "xl") next = "lg"
      else if (prev === "lg") next = "md"
      else if (prev === "md" || prev === "sm") next = "sm"
      localStorage.setItem("eventify_font_size", next)
      applyFontSizeClass(next)
      return next
    })
  }

  const resetFontSize = () => {
    setFontSize("md")
    localStorage.setItem("eventify_font_size", "md")
    applyFontSizeClass("md")
  }

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark"
      localStorage.setItem("eventify_theme", next)
      applyThemeClass(next)
      return next
    })
  }

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        theme,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        toggleTheme,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
}

// Universal Controls Component to put in Navbar / Header
export function AccessibilityControls() {
  const { fontSize, theme, increaseFontSize, decreaseFontSize, resetFontSize, toggleTheme } =
    useAccessibility()

  return (
    <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-full px-2 py-1 shadow-sm text-xs">
      {/* Decrease Font Size (A-) */}
      <button
        onClick={decreaseFontSize}
        title="Decrease font size (A-)"
        aria-label="Decrease font size"
        className="px-2 py-0.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white font-semibold transition-colors"
      >
        A-
      </button>

      {/* Reset Font Size (Default) */}
      <button
        onClick={resetFontSize}
        title="Restore default font size"
        aria-label="Restore default font size"
        className="px-2 py-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-indigo-400 text-[11px] font-medium transition-colors"
      >
        Reset
      </button>

      {/* Increase Font Size (A+) */}
      <button
        onClick={increaseFontSize}
        title="Increase font size (A+)"
        aria-label="Increase font size"
        className="px-2 py-0.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white font-semibold transition-colors"
      >
        A+
      </button>

      <span className="w-px h-3.5 bg-slate-800 mx-1" />

      {/* Dark / Light Mode Toggle */}
      <button
        onClick={toggleTheme}
        title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        aria-label="Toggle Dark and Light Mode"
        className="p-1 rounded-full text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors"
      >
        {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}
