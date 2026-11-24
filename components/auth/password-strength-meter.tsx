"use client"

import { CheckCircle2, XCircle } from "lucide-react"

interface PasswordStrengthMeterProps {
  password: string
}

export function PasswordStrengthMeter({ password = "" }: PasswordStrengthMeterProps) {
  const hasCapital = /[A-Z]/.test(password)
  const hasSmall = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*]/.test(password)
  const hasMinLength = password.length >= 8

  // Score from 0 to 5
  const passedCount = [hasCapital, hasSmall, hasNumber, hasSpecial, hasMinLength].filter(Boolean).length

  let strengthLabel = "Too Weak"
  let strengthColor = "bg-rose-500"
  let textColor = "text-rose-400"
  let progressWidth = "20%"

  if (passedCount <= 1) {
    strengthLabel = "Very Weak"
    strengthColor = "bg-rose-500"
    textColor = "text-rose-400"
    progressWidth = "20%"
  } else if (passedCount === 2) {
    strengthLabel = "Weak"
    strengthColor = "bg-orange-500"
    textColor = "text-orange-400"
    progressWidth = "40%"
  } else if (passedCount === 3) {
    strengthLabel = "Fair"
    strengthColor = "bg-amber-500"
    textColor = "text-amber-400"
    progressWidth = "60%"
  } else if (passedCount === 4) {
    strengthLabel = "Good"
    strengthColor = "bg-blue-500"
    textColor = "text-blue-400"
    progressWidth = "80%"
  } else if (passedCount === 5) {
    strengthLabel = "Strong"
    strengthColor = "bg-emerald-500"
    textColor = "text-emerald-400"
    progressWidth = "100%"
  }

  return (
    <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5 mt-2 text-[11px]">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-300">Live Strength Meter:</span>
        <span className={`font-bold ${textColor}`}>{password.length === 0 ? "Not Entered" : strengthLabel}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${password.length === 0 ? "w-0" : strengthColor}`}
          style={{ width: password.length === 0 ? "0%" : progressWidth }}
        />
      </div>

      {/* 4 Strict Rule Badges */}
      <div className="grid grid-cols-2 gap-1.5 text-slate-400 pt-1">
        <span className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-400 font-medium" : ""}`}>
          {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
          Min 8 characters
        </span>
        <span className={`flex items-center gap-1 ${hasCapital ? "text-emerald-400 font-medium" : ""}`}>
          {hasCapital ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
          One Capital Letter (A-Z)
        </span>
        <span className={`flex items-center gap-1 ${hasSmall ? "text-emerald-400 font-medium" : ""}`}>
          {hasSmall ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
          One Small Letter (a-z)
        </span>
        <span className={`flex items-center gap-1 ${hasNumber ? "text-emerald-400 font-medium" : ""}`}>
          {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
          One Number (0-9)
        </span>
        <span className={`col-span-2 flex items-center gap-1 ${hasSpecial ? "text-emerald-400 font-medium" : ""}`}>
          {hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
          One Special Sign (! @ # $ % ^ & *)
        </span>
      </div>
    </div>
  )
}
