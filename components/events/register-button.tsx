"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { CheckCircle2, UserPlus, XCircle, Loader2 } from "lucide-react"

interface RegisterButtonProps {
  eventId: string
  userId?: string | null
  isRegistered: boolean
  isFull: boolean
  capacity: number
  confirmedCount: number
}

export function RegisterButton({
  eventId,
  userId,
  isRegistered,
  isFull,
  capacity,
  confirmedCount,
}: RegisterButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleRegister = async () => {
    if (!userId) {
      toast.info("Please sign in or create an account to register for events.")
      router.push(`/login?redirect=/events/${eventId}`)
      return
    }

    setLoading(true)
    try {
      // Upsert pattern per Architecture.md: one row per (event_id, user_id)
      const { error } = await supabase.from("registrations").upsert(
        {
          event_id: eventId,
          user_id: userId,
          status: "confirmed",
          registered_at: new Date().toISOString(),
        },
        { onConflict: "event_id,user_id" }
      )

      if (error) {
        throw error
      }

      toast.success("Successfully registered! We look forward to seeing you.")
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to register"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRegistration = async () => {
    if (!userId) return

    setLoading(true)
    try {
      // Soft-cancel per Architecture.md §5.3
      const { error } = await supabase
        .from("registrations")
        .update({ status: "cancelled" })
        .eq("event_id", eventId)
        .eq("user_id", userId)

      if (error) {
        throw error
      }

      toast.info("Registration cancelled. Your seat has been freed.")
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to cancel registration"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (isRegistered) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 gap-2 cursor-default"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>You&apos;re Registered</span>
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleCancelRegistration}
          disabled={loading}
          className="w-full sm:w-auto text-destructive border-border hover:bg-rose-50 hover:text-destructive gap-1.5"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          Cancel RSVP
        </Button>
      </div>
    )
  }

  if (isFull) {
    return (
      <Button
        size="lg"
        disabled
        className="w-full sm:w-auto bg-surface-muted text-muted-foreground border-border cursor-not-allowed"
      >
        Event is Sold Out ({capacity}/{capacity})
      </Button>
    )
  }

  return (
    <Button
      size="lg"
      onClick={handleRegister}
      disabled={loading}
      className="w-full sm:w-auto shadow-medium gap-2 text-base"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Confirming Seat...
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          Register for Event ({capacity - confirmedCount} seats left)
        </>
      )}
    </Button>
  )
}
