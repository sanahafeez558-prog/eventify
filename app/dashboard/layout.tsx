import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Navbar } from "@/components/layout/navbar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirect=/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <Navbar />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Dashboard Main Workspace */}
        <main className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
