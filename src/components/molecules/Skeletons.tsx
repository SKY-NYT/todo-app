import { memo } from "react"

interface ListSkeletonProps {
  rows?: number
}

/**
 * ListSkeleton — shown by Suspense while lazy chunks are loading.
 * Animated pulse keeps the UI feeling alive during code-split loading.
 */
export const ListSkeleton = memo(function ListSkeleton({ rows = 5 }: ListSkeletonProps) {
  return (
    <div className="space-y-2 animate-pulse" aria-busy="true" aria-label="Loading todos">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
          <div className="w-5 h-5 bg-muted rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/4" />
          </div>
          <div className="w-16 h-8 bg-muted rounded" />
        </div>
      ))}
    </div>
  )
})

export const AnalyticsSkeleton = memo(function AnalyticsSkeleton() {
  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border animate-pulse" aria-busy="true">
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="text-center p-3 bg-background rounded-lg">
            <div className="h-8 bg-muted rounded w-12 mx-auto mb-1" />
            <div className="h-3 bg-muted rounded w-16 mx-auto" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-20 h-3 bg-muted rounded" />
            <div className="flex-1 h-2 bg-muted rounded-full" />
            <div className="w-12 h-3 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
})
