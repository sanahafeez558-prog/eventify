import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-32 rounded-2xl bg-surface-muted/60 border border-border" />

      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 space-y-4 bg-surface">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-surface-muted rounded" />
              <div className="w-10 h-10 rounded-xl bg-surface-muted" />
            </div>
            <div className="h-8 w-16 bg-surface-muted rounded" />
            <div className="h-3 w-36 bg-surface-muted rounded" />
          </Card>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-surface-muted rounded" />
        <div className="h-48 rounded-2xl bg-surface-muted/40 border border-border" />
      </div>
    </div>
  );
}
