"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, SlidersHorizontal } from "lucide-react"

interface CategoryOption {
  id: string
  name: string
}

interface EventFiltersProps {
  categories: CategoryOption[]
}

export function EventFilters({ categories }: EventFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSearch = searchParams.get("search") || ""
  const currentCategory = searchParams.get("category") || ""
  const currentSort = searchParams.get("sort") || "upcoming"

  const [searchTerm, setSearchTerm] = useState(currentSearch)

  const applyFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    startTransition(() => {
      router.push(`/events?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilter("search", searchTerm.trim())
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    startTransition(() => {
      router.push("/events")
    })
  }

  const hasActiveFilters = Boolean(currentSearch || currentCategory || currentSort !== "upcoming")

  return (
    <div className="space-y-4 mb-8">
      {/* Search Input & Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events by title or keyword..."
            className="pl-10 h-11"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("")
                applyFilter("search", null)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-2">
          <select
            value={currentSort}
            onChange={(e) => applyFilter("sort", e.target.value)}
            className="h-11 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground shadow-soft focus-visible:outline-none focus-visible:border-primary cursor-pointer"
          >
            <option value="upcoming">Upcoming Events</option>
            <option value="all">All Dates</option>
            <option value="past">Past Events</option>
          </select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="h-11 gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => applyFilter("category", null)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer select-none ${
            !currentCategory
              ? "bg-primary text-white shadow-soft font-semibold"
              : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-muted"
          }`}
        >
          All Categories
        </button>

        {categories.map((cat) => {
          const isSelected = currentCategory === cat.name
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => applyFilter("category", isSelected ? null : cat.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer select-none ${
                isSelected
                  ? "bg-primary text-white shadow-soft font-semibold"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-muted"
              }`}
            >
              {cat.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
