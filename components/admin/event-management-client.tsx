"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Dialog } from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  CalendarDays,
  Search,
  PlusCircle,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
} from "lucide-react"

interface Category {
  id: string
  name: string
}

interface Profile {
  id: string
  full_name: string
  email: string
}

interface EventItem {
  id: string
  title: string
  description: string
  category_id: string | null
  event_date: string
  start_time: string
  end_time: string
  location: string
  max_attendees: number
  status: "published" | "draft" | "cancelled" | "completed"
  image_url: string | null
  organizer_id: string
  created_at: string
  categories?: { name: string } | null
  profiles?: { full_name: string; email: string } | null
}

interface EventManagementClientProps {
  initialEvents: EventItem[]
  categories: Category[]
  organizers: Profile[]
}

export function EventManagementClient({
  initialEvents,
  categories,
  organizers,
}: EventManagementClientProps) {
  const supabase = createClient()
  const [events, setEvents] = useState<EventItem[]>(initialEvents)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [loading, setLoading] = useState(false)

  // Quick Date Edit Modal
  const [dateModalOpen, setDateModalOpen] = useState(false)
  const [selectedEventForDate, setSelectedEventForDate] = useState<EventItem | null>(null)
  const [newDate, setNewDate] = useState("")
  const [newStartTime, setNewStartTime] = useState("")
  const [newEndTime, setNewEndTime] = useState("")

  // Add Event Modal
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addTitle, setAddTitle] = useState("")
  const [addDescription, setAddDescription] = useState("")
  const [addCategoryId, setAddCategoryId] = useState(categories[0]?.id || "")
  const [addOrganizerId, setAddOrganizerId] = useState(organizers[0]?.id || "")
  const [addDate, setAddDate] = useState("")
  const [addStartTime, setAddStartTime] = useState("09:00")
  const [addEndTime, setAddEndTime] = useState("12:00")
  const [addLocation, setAddLocation] = useState("")
  const [addCapacity, setAddCapacity] = useState(50)
  const [addStatus, setAddStatus] = useState<"published" | "draft" | "cancelled">("published")
  const [addImageUrl, setAddImageUrl] = useState("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60")

  // Edit Event Modal
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null)

  // Delete Event Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null)

  const refreshEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*, categories(name), profiles(full_name, email)")
      .order("event_date", { ascending: true })
    if (data) setEvents(data as unknown as EventItem[])
  }

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()) ||
      e.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || e.status === statusFilter
    const matchesCategory = categoryFilter === "all" || e.category_id === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  // Status Change Inline Handler
  const handleStatusChange = async (eventId: string, newStatus: EventItem["status"]) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ status: newStatus })
        .eq("id", eventId)

      if (error) throw error

      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e))
      )
      toast.success(`Event status changed to "${newStatus}"`)
    } catch (err: any) {
      toast.error(err.message || "Failed to update event status")
    }
  }

  // Quick Date Picker Saver
  const openDateModal = (ev: EventItem) => {
    setSelectedEventForDate(ev)
    setNewDate(ev.event_date)
    setNewStartTime(ev.start_time)
    setNewEndTime(ev.end_time)
    setDateModalOpen(true)
  }

  const handleSaveDate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEventForDate) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("events")
        .update({
          event_date: newDate,
          start_time: newStartTime,
          end_time: newEndTime,
        })
        .eq("id", selectedEventForDate.id)

      if (error) throw error

      toast.success(`Event schedule updated to ${newDate}`)
      setDateModalOpen(false)
      await refreshEvents()
    } catch (err: any) {
      toast.error(err.message || "Could not update date")
    } finally {
      setLoading(false)
    }
  }

  // Add Event Handler
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addTitle.trim() || !addDate || !addLocation.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from("events").insert({
        title: addTitle.trim(),
        description: addDescription.trim(),
        category_id: addCategoryId || null,
        organizer_id: addOrganizerId,
        event_date: addDate,
        start_time: addStartTime,
        end_time: addEndTime,
        location: addLocation.trim(),
        max_attendees: Number(addCapacity),
        status: addStatus,
        image_url: addImageUrl,
      })

      if (error) throw error

      toast.success(`Event "${addTitle}" created successfully!`)
      setAddModalOpen(false)
      setAddTitle("")
      setAddDescription("")
      await refreshEvents()
    } catch (err: any) {
      toast.error(err.message || "Could not create event")
    } finally {
      setLoading(false)
    }
  }

  // Edit Event Handler
  const openEditModal = (ev: EventItem) => {
    setEventToEdit(ev)
    setAddTitle(ev.title)
    setAddDescription(ev.description)
    setAddCategoryId(ev.category_id || categories[0]?.id || "")
    setAddOrganizerId(ev.organizer_id)
    setAddDate(ev.event_date)
    setAddStartTime(ev.start_time)
    setAddEndTime(ev.end_time)
    setAddLocation(ev.location)
    setAddCapacity(ev.max_attendees)
    setAddStatus(ev.status === "completed" ? "published" : ev.status)
    setAddImageUrl(ev.image_url || "")
    setEditModalOpen(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventToEdit) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("events")
        .update({
          title: addTitle.trim(),
          description: addDescription.trim(),
          category_id: addCategoryId || null,
          organizer_id: addOrganizerId,
          event_date: addDate,
          start_time: addStartTime,
          end_time: addEndTime,
          location: addLocation.trim(),
          max_attendees: Number(addCapacity),
          status: addStatus,
          image_url: addImageUrl,
        })
        .eq("id", eventToEdit.id)

      if (error) throw error

      toast.success(`Event "${addTitle}" updated successfully!`)
      setEditModalOpen(false)
      await refreshEvents()
    } catch (err: any) {
      toast.error(err.message || "Failed to update event")
    } finally {
      setLoading(false)
    }
  }

  // Delete Event Handler
  const openDeleteModal = (ev: EventItem) => {
    setEventToDelete(ev)
    setDeleteModalOpen(true)
  }

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventToDelete.id)

      if (error) throw error

      toast.success(`Event "${eventToDelete.title}" deleted.`)
      setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id))
      setDeleteModalOpen(false)
      setEventToDelete(null)
    } catch (err: any) {
      toast.error(err.message || "Could not delete event")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-purple-600" />
            Events Management & Scheduling
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Add new events, set dates, change times, update capacity, and control publication status.
          </p>
        </div>

        <Button
          onClick={() => {
            setAddTitle("")
            setAddDescription("")
            setAddDate(new Date().toISOString().split("T")[0])
            setAddModalOpen(true)
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-2 shadow-soft shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Event
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border shadow-soft">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search event title, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Category Filter */}
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 text-xs w-36"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 text-xs w-32"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </Select>

            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {filteredEvents.length} Events
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card className="border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Event Details</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Organizer</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-surface-muted/50 transition-colors">
                    {/* Event Title & Category */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {ev.image_url ? (
                          <img
                            src={ev.image_url}
                            alt={ev.title}
                            className="w-11 h-11 rounded-lg object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                            <CalendarDays className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-foreground line-clamp-1">{ev.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] bg-slate-50">
                              {ev.categories?.name || "General"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Cap: {ev.max_attendees}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date & Time with Quick Date Button */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => openDateModal(ev)}
                        className="group flex flex-col items-start text-left p-1.5 rounded-lg hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-200"
                        title="Click to change date & time"
                      >
                        <span className="font-semibold text-purple-700 text-xs flex items-center gap-1 group-hover:underline">
                          <CalendarIcon className="w-3.5 h-3.5 text-purple-500" />
                          {ev.event_date}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {ev.start_time.substring(0, 5)} - {ev.end_time.substring(0, 5)}
                        </span>
                      </button>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        {ev.location}
                      </span>
                    </td>

                    {/* Organizer */}
                    <td className="py-3.5 px-4 text-xs font-medium text-foreground">
                      {ev.profiles?.full_name || "Admin"}
                    </td>

                    {/* Status Inline Dropdown */}
                    <td className="py-3.5 px-4">
                      <Select
                        value={ev.status}
                        onChange={(e) =>
                          handleStatusChange(ev.id, e.target.value as EventItem["status"])
                        }
                        className={`h-8 text-xs font-semibold w-28 border-0 capitalize ${
                          ev.status === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : ev.status === "draft"
                            ? "bg-amber-100 text-amber-800"
                            : ev.status === "cancelled"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </Select>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDateModal(ev)}
                          className="h-8 w-8 p-0 text-purple-600 hover:bg-purple-50"
                          title="Set Date & Time"
                        >
                          <CalendarIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(ev)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-purple-600 hover:bg-purple-50"
                          title="Edit Full Event Details"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(ev)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-rose-50"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                    No events matching search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Set Date & Time Modal */}
      <Dialog
        open={dateModalOpen}
        onClose={() => setDateModalOpen(false)}
        title="Set Event Date & Time"
        description={`Update schedule for "${selectedEventForDate?.title}"`}
      >
        <form onSubmit={handleSaveDate} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Event Date</label>
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Start Time</label>
              <Input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">End Time</label>
              <Input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setDateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save New Date"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Add / Edit Full Event Modal */}
      <Dialog
        open={addModalOpen || editModalOpen}
        onClose={() => {
          setAddModalOpen(false)
          setEditModalOpen(false)
        }}
        title={editModalOpen ? "Edit Event Details" : "Create New Event"}
        description={editModalOpen ? "Modify event parameters as Admin." : "Fill details to add event."}
        className="max-w-lg"
      >
        <form onSubmit={editModalOpen ? handleSaveEdit : handleAddEvent} className="space-y-3 mt-2 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Event Title *</label>
            <Input
              placeholder="e.g. AI & Cloud Engineering Summit 2026"
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Description *</label>
            <Textarea
              placeholder="Full event description..."
              rows={3}
              value={addDescription}
              onChange={(e) => setAddDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Category</label>
              <Select
                value={addCategoryId}
                onChange={(e) => setAddCategoryId(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Organizer</label>
              <Select
                value={addOrganizerId}
                onChange={(e) => setAddOrganizerId(e.target.value)}
              >
                {organizers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.full_name} ({o.email})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Date *</label>
              <Input
                type="date"
                value={addDate}
                onChange={(e) => setAddDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Start Time</label>
              <Input
                type="time"
                value={addStartTime}
                onChange={(e) => setAddStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">End Time</label>
              <Input
                type="time"
                value={addEndTime}
                onChange={(e) => setAddEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Location *</label>
              <Input
                placeholder="e.g. Auditorium A, Tech Center"
                value={addLocation}
                onChange={(e) => setAddLocation(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Max Attendees *</label>
              <Input
                type="number"
                min={1}
                value={addCapacity}
                onChange={(e) => setAddCapacity(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Status</label>
              <Select
                value={addStatus}
                onChange={(e) => setAddStatus(e.target.value as any)}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Cover Image URL</label>
              <Input
                placeholder="https://images.unsplash.com/..."
                value={addImageUrl}
                onChange={(e) => setAddImageUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAddModalOpen(false)
                setEditModalOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editModalOpen ? "Save Changes" : "Create Event"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Event Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Event"
        description="Are you sure you want to delete this event? All attendee RSVPs will be removed."
      >
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 my-3 text-rose-800 text-sm">
          <p className="font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Delete Event Confirmation
          </p>
          <p className="mt-1 text-xs">
            Event: <strong>{eventToDelete?.title}</strong>
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDeleteEvent}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-rose-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Event"}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
