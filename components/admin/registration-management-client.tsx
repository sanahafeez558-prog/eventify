"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Dialog } from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  TicketCheck,
  Search,
  PlusCircle,
  CalendarDays,
  User,
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldAlert,
} from "lucide-react"

interface RegistrationRecord {
  id: string
  event_id: string
  user_id: string
  registered_at: string
  status: "confirmed" | "cancelled"
  events?: { title: string; event_date: string; location: string } | null
  profiles?: { full_name: string; email: string } | null
}

interface SimpleEvent {
  id: string
  title: string
  event_date: string
}

interface SimpleUser {
  id: string
  full_name: string
  email: string
}

interface RegistrationManagementClientProps {
  initialRegistrations: RegistrationRecord[]
  events: SimpleEvent[]
  users: SimpleUser[]
}

export function RegistrationManagementClient({
  initialRegistrations,
  events,
  users,
}: RegistrationManagementClientProps) {
  const supabase = createClient()
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>(initialRegistrations)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [eventFilter, setEventFilter] = useState<string>("all")
  const [loading, setLoading] = useState(false)

  // Add Registration Modal
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || "")
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || "")
  const [addStatus, setAddStatus] = useState<"confirmed" | "cancelled">("confirmed")

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [regToDelete, setRegToDelete] = useState<RegistrationRecord | null>(null)

  const refreshRegistrations = async () => {
    const { data } = await supabase
      .from("registrations")
      .select("*, events(title, event_date, location), profiles(full_name, email)")
      .order("registered_at", { ascending: false })

    if (data) setRegistrations(data as unknown as RegistrationRecord[])
  }

  // Filtered List
  const filtered = registrations.filter((r) => {
    const matchesSearch =
      r.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.events?.title?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    const matchesEvent = eventFilter === "all" || r.event_id === eventFilter
    return matchesSearch && matchesStatus && matchesEvent
  })

  // Toggle RSVP Status
  const handleToggleStatus = async (r: RegistrationRecord) => {
    const newStatus = r.status === "confirmed" ? "cancelled" : "confirmed"
    try {
      const { error } = await supabase
        .from("registrations")
        .update({ status: newStatus })
        .eq("id", r.id)

      if (error) throw error

      setRegistrations((prev) =>
        prev.map((item) => (item.id === r.id ? { ...item, status: newStatus } : item))
      )
      toast.success(`Registration status updated to ${newStatus}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    }
  }

  // Add RSVP Handler
  const handleAddRSVP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEventId || !selectedUserId) {
      toast.error("Please select both Event and User")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from("registrations")
        .upsert(
          {
            event_id: selectedEventId,
            user_id: selectedUserId,
            status: addStatus,
          },
          { onConflict: "event_id,user_id" }
        )

      if (error) throw error

      toast.success("RSVP registration successfully saved!")
      setAddModalOpen(false)
      await refreshRegistrations()
    } catch (err: any) {
      toast.error(err.message || "Could not save RSVP")
    } finally {
      setLoading(false)
    }
  }

  // Delete Handler
  const handleDeleteRSVP = async () => {
    if (!regToDelete) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("registrations")
        .delete()
        .eq("id", regToDelete.id)

      if (error) throw error

      toast.success("Registration record removed.")
      setRegistrations((prev) => prev.filter((r) => r.id !== regToDelete.id))
      setDeleteModalOpen(false)
      setRegToDelete(null)
    } catch (err: any) {
      toast.error(err.message || "Failed to remove registration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TicketCheck className="w-6 h-6 text-purple-600" />
            Registration & RSVP Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor attendee registrations, issue manually added RSVPs, or cancel registrations.
          </p>
        </div>

        <Button
          onClick={() => setAddModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-2 shadow-soft shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Add User RSVP
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border shadow-soft">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search user, email, or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <Select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="h-9 text-xs w-44"
            >
              <option value="all">All Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 text-xs w-32"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </Select>

            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {filtered.length} Records
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Attendee Info</th>
                <th className="py-3.5 px-4">Event Title</th>
                <th className="py-3.5 px-4">Event Date</th>
                <th className="py-3.5 px-4">RSVP Status</th>
                <th className="py-3.5 px-4">Registration Time</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filtered.length > 0 ? (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-muted/50 transition-colors">
                    {/* Attendee */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {r.profiles?.full_name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground line-clamp-1">
                            {r.profiles?.full_name || "Unknown User"}
                          </p>
                          <p className="text-xs text-muted-foreground">{r.profiles?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Event Title */}
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {r.events?.title || "Unknown Event"}
                    </td>

                    {/* Event Date */}
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      {r.events?.event_date || "—"}
                    </td>

                    {/* RSVP Status */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(r)}
                        className="group flex items-center gap-1.5"
                        title="Click to toggle status"
                      >
                        <Badge
                          variant="outline"
                          className={`capitalize cursor-pointer transition-all ${
                            r.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-200 group-hover:bg-rose-100"
                          }`}
                        >
                          {r.status === "confirmed" ? (
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1 text-rose-600" />
                          )}
                          {r.status}
                        </Badge>
                      </button>
                    </td>

                    {/* Registration Time */}
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      {new Date(r.registered_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRegToDelete(r)
                          setDeleteModalOpen(true)
                        }}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-rose-50"
                        title="Remove Registration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                    No RSVP registration records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add RSVP Modal */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register User for Event"
        description="Manually create an RSVP registration entry for any user."
      >
        <form onSubmit={handleAddRSVP} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Select Event</label>
            <Select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.event_date})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Select User / Attendee</label>
            <Select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.email})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Status</label>
            <Select
              value={addStatus}
              onChange={(e) => setAddStatus(e.target.value as any)}
            >
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save RSVP"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete RSVP Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Remove Registration Record"
        description="Remove this registration entry from database?"
      >
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 my-3 text-rose-800 text-sm">
          <p className="font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Remove Registration
          </p>
          <p className="mt-1 text-xs">
            User: <strong>{regToDelete?.profiles?.full_name}</strong> for event{" "}
            <strong>{regToDelete?.events?.title}</strong>
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDeleteRSVP}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-rose-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remove Record"}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
