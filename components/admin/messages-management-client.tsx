"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  MessageSquare,
  Search,
  Mail,
  Trash2,
  Eye,
  Calendar,
  User,
  Loader2,
  ShieldAlert,
} from "lucide-react"

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}

interface MessagesManagementClientProps {
  initialMessages: ContactMessage[]
}

export function MessagesManagementClient({
  initialMessages,
}: MessagesManagementClientProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  // View Modal
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [msgToDelete, setMsgToDelete] = useState<ContactMessage | null>(null)

  const filtered = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase())
  )

  const handleDeleteMessage = async () => {
    if (!msgToDelete) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", msgToDelete.id)

      if (error) throw error

      toast.success("Message deleted successfully.")
      setMessages((prev) => prev.filter((m) => m.id !== msgToDelete.id))
      setDeleteModalOpen(false)
      setMsgToDelete(null)
    } catch (err: any) {
      toast.error(err.message || "Failed to delete message")
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
            <MessageSquare className="w-6 h-6 text-purple-600" />
            Contact Form Submissions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Read and manage user support requests and platform inquiries.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border shadow-soft">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search sender, email, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            {filtered.length} Inquiries Received
          </Badge>
        </CardContent>
      </Card>

      {/* Messages List Table */}
      <Card className="border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Sender</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Preview</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filtered.length > 0 ? (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-muted/50 transition-colors">
                    {/* Sender */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground line-clamp-1">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {m.subject}
                    </td>

                    {/* Preview */}
                    <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-xs">
                      <p className="line-clamp-1">{m.message}</p>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(m.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMessage(m)
                            setViewModalOpen(true)
                          }}
                          className="h-8 w-8 p-0 text-purple-600 hover:bg-purple-50"
                          title="View Full Message"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setMsgToDelete(m)
                            setDeleteModalOpen(true)
                          }}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-rose-50"
                          title="Delete Message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                    No contact messages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Message Modal */}
      <Dialog
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={selectedMessage?.subject || "Message Details"}
        description={`Received from ${selectedMessage?.name} (${selectedMessage?.email})`}
      >
        <div className="space-y-4 my-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground pb-2 border-b border-border">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <User className="w-3.5 h-3.5 text-purple-600" />
              {selectedMessage?.name}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              {selectedMessage?.email}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-surface-muted border border-border text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {selectedMessage?.message}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>
        </div>
      </Dialog>

      {/* Delete Message Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Contact Inquiry"
        description="Permanently delete this message from the system database?"
      >
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 my-3 text-rose-800 text-sm">
          <p className="font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Confirm Deletion
          </p>
          <p className="mt-1 text-xs">
            Subject: <strong>{msgToDelete?.subject}</strong> from {msgToDelete?.name}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDeleteMessage}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-rose-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Message"}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
