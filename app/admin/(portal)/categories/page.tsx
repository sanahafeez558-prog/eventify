import { createClient } from "@/lib/supabase/server"
import { CategoryManagementClient, type CategoryItem } from "@/components/admin/category-management-client"

export const metadata = {
  title: "Manage Categories — Admin Portal",
}

export default async function AdminCategoriesPage() {
  const supabase = await createClient()

  // Fetch categories with event counts
  const { data: rawCategories } = await supabase
    .from("categories")
    .select("*, events(id)")
    .order("name", { ascending: true })

  const categories: CategoryItem[] = (rawCategories || []).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    icon: cat.icon,
    created_at: cat.created_at,
    event_count: cat.events?.length || 0,
  }))

  return <CategoryManagementClient initialCategories={categories} />
}
