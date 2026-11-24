"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Dialog } from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  Users,
  Search,
  UserPlus,
  Shield,
  Edit2,
  Trash2,
  CheckCircle,
  Filter,
  Mail,
  User,
  ShieldAlert,
  Loader2,
} from "lucide-react"

interface UserProfile {
  id: string
  full_name: string
  email: string
  role: "attendee" | "organizer" | "admin"
  avatar_url: string | null
  created_at: string
}

interface UserManagementClientProps {
  initialUsers: UserProfile[]
}

export function UserManagementClient({ initialUsers }: UserManagementClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [users, setUsers] = useState<UserProfile[]>(initialUsers)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [loading, setLoading] = useState(false)

  // Add User State
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addName, setAddName] = useState("")
  const [addEmail, setAddEmail] = useState("")
  const [addPassword, setAddPassword] = useState("")
  const [addRole, setAddRole] = useState<"attendee" | "organizer" | "admin">("attendee")

  // Edit User State
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editRole, setEditRole] = useState<"attendee" | "organizer" | "admin">("attendee")

  // Delete User State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null)

  // Refresh Users
  const refreshUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
    if (!error && data) {
      setUsers(data as UserProfile[])
    }
  }

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  // Quick Role Change Handler
  const handleRoleChange = async (userId: string, newRole: "attendee" | "organizer" | "admin") => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId)

      if (error) throw error

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
      toast.success(`Role updated to ${newRole.toUpperCase()}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to update user role")
    }
  }

  // Add User Submission
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addName.trim() || !addEmail.trim()) {
      toast.error("Please fill in Name and Email")
      return
    }

    setLoading(true)
    try {
      // 1. Create Auth User via Supabase client signup
      const temporaryPassword = addPassword.trim() || "EventifyPass123!"
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: addEmail.trim(),
        password: temporaryPassword,
        options: {
          data: {
            full_name: addName.trim(),
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Update role in profiles
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ role: addRole, full_name: addName.trim() })
          .eq("id", authData.user.id)

        if (profileError) {
          // If trigger auto-inserted profile, update it
          await supabase
            .from("profiles")
            .upsert({
              id: authData.user.id,
              full_name: addName.trim(),
              email: addEmail.trim(),
              role: addRole,
            })
        }
      }

      toast.success(`User "${addName}" successfully added!`)
      setAddModalOpen(false)
      setAddName("")
      setAddEmail("")
      setAddPassword("")
      setAddRole("attendee")
      await refreshUsers()
    } catch (err: any) {
      toast.error(err.message || "Could not add user")
    } finally {
      setLoading(false)
    }
  }

  // Open Edit Modal
  const openEditModal = (user: UserProfile) => {
    setSelectedUser(user)
    setEditName(user.full_name)
    setEditEmail(user.email)
    setEditRole(user.role)
    setEditModalOpen(true)
  }

  // Save Edit User
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editName.trim(),
          email: editEmail.trim(),
          role: editRole,
        })
        .eq("id", selectedUser.id)

      if (error) throw error

      toast.success(`Profile for "${editName}" updated!`)
      setEditModalOpen(false)
      await refreshUsers()
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  // Open Delete Modal
  const openDeleteModal = (user: UserProfile) => {
    setUserToDelete(user)
    setDeleteModalOpen(true)
  }

  // Confirm Delete User
  const handleDeleteUser = async () => {
    if (!userToDelete) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userToDelete.id)

      if (error) throw error

      toast.success(`User "${userToDelete.full_name}" deleted from system.`)
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
      setDeleteModalOpen(false)
      setUserToDelete(null)
    } catch (err: any) {
      toast.error(err.message || "Could not delete user")
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
            <Users className="w-6 h-6 text-purple-600" />
            User Account Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View, search, edit roles, add, or delete user accounts across Eventify.
          </p>
        </div>

        <Button
          onClick={() => setAddModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-2 shadow-soft shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Add New User
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-border shadow-soft">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Role Filter & Count */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Role:</span>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-9 text-xs w-36"
              >
                <option value="all">All Roles ({users.length})</option>
                <option value="attendee">Attendees</option>
                <option value="organizer">Organizers</option>
                <option value="admin">Admins</option>
              </Select>
            </div>

            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Showing {filteredUsers.length} Users
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Users Data Table */}
      <Card className="border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">User Details</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Current Role</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-muted/50 transition-colors">
                    {/* User Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm shrink-0">
                          {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground line-clamp-1">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{user.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 font-medium text-muted-foreground">
                      {user.email}
                    </td>

                    {/* Role Select Inline */}
                    <td className="py-3.5 px-4">
                      <Select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value as "attendee" | "organizer" | "admin")
                        }
                        className={`h-8 text-xs font-semibold w-32 border-0 ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "organizer"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <option value="attendee">Attendee</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </Select>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(user)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-purple-600 hover:bg-purple-50"
                          title="Edit User Profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(user)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-rose-50"
                          title="Delete User Account"
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
                    No users matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add User Modal */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New User Account"
        description="Create a new profile and assign role in Eventify."
      >
        <form onSubmit={handleAddUser} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Full Name</label>
            <Input
              placeholder="e.g. Adeeba Hafeez"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Email Address</label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Temporary Password (Optional)</label>
            <Input
              type="password"
              placeholder="Defaults to EventifyPass123!"
              value={addPassword}
              onChange={(e) => setAddPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Assigned Role</label>
            <Select
              value={addRole}
              onChange={(e) => setAddRole(e.target.value as "attendee" | "organizer" | "admin")}
            >
              <option value="attendee">Attendee (Can discover & register)</option>
              <option value="organizer">Organizer (Can host events)</option>
              <option value="admin">Admin (Full System Control)</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create User"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit User Profile"
        description="Update user name, email, or system role."
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Full Name</label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Email</label>
            <Input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">System Role</label>
            <Select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as "attendee" | "organizer" | "admin")}
            >
              <option value="attendee">Attendee</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete User Profile"
        description="Are you sure you want to permanently delete this user account? All registrations will be removed."
      >
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 my-3 text-rose-800 text-sm">
          <p className="font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Warning: Irreversible Action
          </p>
          <p className="mt-1 text-xs">
            User: <strong>{userToDelete?.full_name}</strong> ({userToDelete?.email})
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDeleteUser}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-rose-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Permanently"}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
