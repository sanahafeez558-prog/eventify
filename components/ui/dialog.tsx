"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-150"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        className={cn(
          "relative z-50 w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-medium animate-in zoom-in-95 duration-150",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1 text-muted-foreground hover:bg-surface-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
