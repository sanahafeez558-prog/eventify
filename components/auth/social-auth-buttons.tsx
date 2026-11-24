"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface SocialAuthButtonsProps {
  redirectTo?: string
}

export function SocialAuthButtons({ redirectTo = "/dashboard" }: SocialAuthButtonsProps) {
  const [googleLoading, setGoogleLoading] = useState(false)
  const [facebookLoading, setFacebookLoading] = useState(false)
  const supabase = createClient()

  const handleOAuthLogin = async (provider: "google" | "facebook") => {
    try {
      if (provider === "google") setGoogleLoading(true)
      if (provider === "facebook") setFacebookLoading(true)

      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const callbackUrl = `${origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl,
        },
      })

      if (error) {
        // If OAuth provider is not yet enabled in Supabase dashboard, provide clear guidance
        if (
          error.message.toLowerCase().includes("not enabled") ||
          error.message.toLowerCase().includes("unsupported provider")
        ) {
          toast.error(
            `${provider === "google" ? "Google" : "Facebook"} sign-in requires Client ID & Secret in Supabase dashboard. Please use email & password.`
          )
        } else {
          toast.error(error.message)
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to initiate social sign in"
      toast.error(message)
    } finally {
      setGoogleLoading(false)
      setFacebookLoading(false)
    }
  }

  return (
    <div className="space-y-2.5 w-full">
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-950 px-2 text-slate-400 font-medium">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="outline"
          disabled={googleLoading || facebookLoading}
          onClick={() => handleOAuthLogin("google")}
          className="w-full h-10 border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:text-white text-slate-200 text-xs font-semibold gap-2 transition-all"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.56 0 2.96.54 4.07 1.6l3.05-3.05C17.26 1.8 14.82 1 12 1 7.42 1 3.51 3.58 1.63 7.34l3.71 2.88C6.23 7.34 8.87 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.8-.07-1.57-.2-2.27H12v4.51h6.47c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.7-4.94 3.7-8.69z"
              />
              <path
                fill="#FBBC05"
                d="M5.34 14.78c-.24-.71-.38-1.47-.38-2.28s.14-1.57.38-2.28L1.63 7.34C.59 9.42 0 11.64 0 14s.59 4.58 1.63 6.66l3.71-2.88z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.08.73-2.47 1.16-4.26 1.16-3.13 0-5.77-2.34-6.66-5.22L1.63 16c1.88 3.76 5.79 6.34 10.37 6.34z"
              />
            </svg>
          )}
          <span>Google</span>
        </Button>

        {/* Facebook OAuth Button */}
        <Button
          type="button"
          variant="outline"
          disabled={googleLoading || facebookLoading}
          onClick={() => handleOAuthLogin("facebook")}
          className="w-full h-10 border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:text-white text-slate-200 text-xs font-semibold gap-2 transition-all"
        >
          {facebookLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          ) : (
            <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          )}
          <span>Facebook</span>
        </Button>
      </div>
    </div>
  )
}
