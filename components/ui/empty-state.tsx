import * as React from "react"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-surface-muted/30">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-soft">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        actionHref ? (
          <Button asChild>
            <a href={actionHref}>{actionLabel}</a>
          </Button>
        ) : onAction ? (
          <Button onClick={onAction}>{actionLabel}</Button>
        ) : null
      )}
    </div>
  )
}
