import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export function EventCardSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden border-border bg-surface animate-pulse">
      {/* 16:9 Image placeholder */}
      <div className="aspect-video w-full bg-surface-muted" />

      <CardHeader className="p-5 pb-2 space-y-2">
        <div className="h-5 bg-surface-muted rounded-md w-3/4" />
        <div className="h-4 bg-surface-muted rounded-md w-full" />
        <div className="h-4 bg-surface-muted rounded-md w-2/3" />
      </CardHeader>

      <CardContent className="p-5 pt-2 flex-1 space-y-2.5">
        <div className="h-3.5 bg-surface-muted rounded w-1/2" />
        <div className="h-3.5 bg-surface-muted rounded w-2/5" />
      </CardContent>

      <CardFooter className="p-5 pt-3 border-t border-border/60 flex items-center justify-between mt-auto">
        <div className="h-4 bg-surface-muted rounded w-1/3" />
        <div className="h-8 bg-surface-muted rounded-lg w-20" />
      </CardFooter>
    </Card>
  )
}
