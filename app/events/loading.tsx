import { EventCardSkeleton } from "@/components/events/event-card-skeleton";

export default function EventsLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-surface-muted rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-surface-muted rounded-md animate-pulse" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pb-6 border-b border-border">
        <div className="h-10 w-full sm:w-72 bg-surface-muted rounded-lg animate-pulse" />
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-20 bg-surface-muted rounded-full animate-pulse" />
          ))}
        </div>
      </div>

      {/* Grid of skeleton event cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
