"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  Layers,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react"

export interface CategoryItem {
  id: string
  name: string
  description: string | null
  icon: string | null
  created_at: string
  event_count?: number
}

interface CategoryManagementClientProps {
  initialCategories: CategoryItem[]
}

const AVAILABLE_ICONS = [
  "Laptop",
  "Briefcase",
  "GraduationCap",
  "Users",
  "Wrench",
  "Film",
  "Trophy",
  "Heart",
  "Sparkles",
  "Music",
  "Camera",
  "BookOpen",
]

export function CategoryManagementClient({
  initialCategories,
}: CategoryManagementClientProps) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null)
  const [dependentCount, setDependentCount] = useState<number>(0)
  const [checkingDependencies, setCheckingDependencies] = useState(false)

  // Form State
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("Sparkles")

  const supabase = createClient()

  // Filtered categories
  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  )

  const openAddModal = () => {
    setName("")
    setDescription("")
    setIcon("Sparkles")
    setIsAddOpen(true)
  }

  const openEditModal = (cat: CategoryItem) => {
    setSelectedCategory(cat)
    setName(cat.name)
    setDescription(cat.description || "")
    setIcon(cat.icon || "Sparkles")
    setIsEditOpen(true)
  }

  const openDeleteModal = async (cat: CategoryItem) => {
    setSelectedCategory(cat)
    setCheckingDependencies(true)
    setIsDeleteOpen(true)

    try {
      // Check if any events reference this category
      const { count, error } = await supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("category_id", cat.id)

      if (!error && typeof count === "number") {
        setDependentCount(count)
      } else {
        setDependentCount(0)
      }
    } catch {
      setDependentCount(0)
    } finally {
      setCheckingDependencies(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          icon: icon || "Sparkles",
        })
        .select()
        .single()

      if (error) throw error

      setCategories((prev) => [...prev, { ...data, event_count: 0 }])
      toast.success(`Category "${name}" created successfully!`)
      setIsAddOpen(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create category"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory || !name.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: name.trim(),
          description: description.trim() || null,
          icon: icon || "Sparkles",
        })
        .eq("id", selectedCategory.id)

      if (error) throw error

      setCategories((prev) =>
        prev.map((c) =>
          c.id === selectedCategory.id
            ? { ...c, name: name.trim(), description: description.trim() || null, icon }
            : c
        )
      )
      toast.success(`Category "${name}" updated successfully!`)
      setIsEditOpen(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update category"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", selectedCategory.id)

      if (error) throw error

      setCategories((prev) => prev.filter((c) => c.id !== selectedCategory.id))
      toast.success(`Category "${selectedCategory.name}" removed successfully.`)
      setIsDeleteOpen(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete category"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-purple-400" />
            Category Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize events across topics, add new niches, and edit catalog categories
          </p>
        </div>

        <Button
          onClick={openAddModal}
          className="bg-purple-600 hover:bg-purple-500 text-white font-semibold gap-2 border-0 shadow-glow"
        >
          <PlusCircle className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search categories by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs h-10"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cat) => (
          <Card
            key={cat.id}
            className="bg-slate-900/80 border-slate-800 text-slate-100 hover:border-purple-500/40 transition-colors"
          >
            <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-white">{cat.name}</CardTitle>
                  <span className="text-[10px] text-slate-400">Icon: {cat.icon || "Default"}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Edit category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => openDeleteModal(cat)}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p className="text-slate-400 text-xs line-clamp-2 min-h-[32px]">
                {cat.description || "No description provided."}
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-400" />
                  {cat.event_count ?? 0} Events linked
                </span>
                <span>ID: {cat.id.slice(0, 8)}...</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No categories found matching &quot;{search}&quot;.
          </div>
        )}
      </div>

      {/* ADD CATEGORY MODAL */}
      <Dialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Category"
        description="Create a new event category for organizers and attendees."
      >
        <form onSubmit={handleAddCategory} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Category Name</label>
            <Input
              required
              placeholder="e.g. Design & Creative"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-950 border-slate-800 text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Description</label>
            <Textarea
              placeholder="Brief summary of events included in this category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-950 border-slate-800 text-slate-100 text-xs min-h-[70px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Icon Marker</label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              {AVAILABLE_ICONS.map((ic) => (
                <option key={ic} value={ic}>
                  {ic}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              className="border-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Category"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* EDIT CATEGORY MODAL */}
      <Dialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Category"
        description="Update category title, description, or icon."
      >
        <form onSubmit={handleEditCategory} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Category Name</label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-950 border-slate-800 text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-950 border-slate-800 text-slate-100 text-xs min-h-[70px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Icon Marker</label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              {AVAILABLE_ICONS.map((ic) => (
                <option key={ic} value={ic}>
                  {ic}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="border-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Category"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG (DEPENDENCY CHECKED) */}
      <Dialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Category Deletion"
        description={`Are you sure you want to delete category "${selectedCategory?.name}"?`}
      >
        <div className="space-y-3 py-2 text-xs text-slate-300 leading-relaxed">
          {checkingDependencies ? (
            <div className="flex items-center gap-2 text-indigo-400 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking dependent events in database...</span>
            </div>
          ) : dependentCount > 0 ? (
            <div className="p-3 bg-amber-950/60 border border-amber-500/30 rounded-xl text-amber-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Dependency Warning: {dependentCount} event(s) depend on this category
              </p>
              <p className="text-[11px] text-amber-200/80">
                Deleting will safely set their category to Unassigned without deleting the events themselves.
              </p>
            </div>
          ) : (
            <p className="text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              No events currently depend on this category. Safe to delete.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="border-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteCategory}
              disabled={loading || checkingDependencies}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Delete"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
