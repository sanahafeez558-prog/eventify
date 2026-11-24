"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Cookie, ShieldCheck, Check, X, Sliders, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CookieConsentModal() {
  const [visible, setVisible] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)

  // Preferences toggles
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true)

  useEffect(() => {
    const consent = localStorage.getItem("eventify_cookie_consent")
    if (!consent) {
      // Delay prompt slightly for polished UX
      const timer = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    localStorage.setItem(
      "eventify_cookie_consent",
      JSON.stringify({
        essential: true,
        analytics: true,
        personalization: true,
        timestamp: new Date().toISOString(),
      })
    )
    setVisible(false)
  }

  const handleRejectAll = () => {
    localStorage.setItem(
      "eventify_cookie_consent",
      JSON.stringify({
        essential: true,
        analytics: false,
        personalization: false,
        timestamp: new Date().toISOString(),
      })
    )
    setVisible(false)
  }

  const handleSaveCustom = () => {
    localStorage.setItem(
      "eventify_cookie_consent",
      JSON.stringify({
        essential: true,
        analytics: analyticsEnabled,
        personalization: personalizationEnabled,
        timestamp: new Date().toISOString(),
      })
    )
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-8 md:right-auto md:max-w-lg z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="p-6 rounded-3xl bg-slate-950/95 border border-indigo-500/30 backdrop-blur-xl shadow-2xl text-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Cookie & Privacy Preferences
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We use strictly necessary cookies to ensure secure login sessions and CSRF protection. You can configure non-essential cookies below or read our{" "}
              <Link href="/cookies" className="text-indigo-400 underline hover:text-indigo-300">
                Cookie Policy
              </Link>.
            </p>
          </div>
        </div>

        {/* Expandable Preferences Drawer */}
        {showPreferences && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
            {/* Strictly Necessary (Locked) */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div>
                <span className="font-semibold text-white">Strictly Necessary Cookies</span>
                <p className="text-[11px] text-slate-400">Required for authentication, security tokens, and seat RSVP reservation.</p>
              </div>
              <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                Always Active
              </span>
            </div>

            {/* Personalization & Font Scaling */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div>
                <span className="font-semibold text-white">Accessibility & Theme Preferences</span>
                <p className="text-[11px] text-slate-400">Remembers your A+/A- font scaling and Dark/Light mode preferences.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={personalizationEnabled}
                  onChange={(e) => setPersonalizationEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">Performance Metrics</span>
                <p className="text-[11px] text-slate-400">Helps us monitor server response times and API uptime anonymously.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 text-xs">
          <Button
            size="sm"
            onClick={handleAcceptAll}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-9 px-4"
          >
            Accept All
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRejectAll}
            className="w-full sm:w-auto border-slate-800 hover:bg-slate-900 text-slate-300 text-xs h-9 px-4"
          >
            Reject Non-Essential
          </Button>

          {showPreferences ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveCustom}
              className="w-full sm:w-auto border-purple-500/40 text-purple-300 hover:bg-purple-950/40 text-xs h-9 px-4"
            >
              Save Preferences
            </Button>
          ) : (
            <button
              onClick={() => setShowPreferences(true)}
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 sm:ml-auto py-1"
            >
              <Sliders className="w-3.5 h-3.5" />
              Manage Preferences
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
