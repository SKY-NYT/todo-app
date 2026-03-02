import { memo, useMemo, useCallback } from "react"
import { useTodos } from "@/context/TodoContext"
import { computeAnalytics } from "@/utils/todoUtils"

/**
 * TodoAnalytics — memoised component.
 * All expensive reduce chains are cached with useMemo.
 * Sort/filter handlers come from context (already useCallback-stable).
 */
const TodoAnalytics = memo(function TodoAnalytics() {
  const { todos, sortBy, filterTag, setSort, setFilterTag } = useTodos()

  // useMemo: analytics only recompute when todos array changes
  const { allTags, priorityDistribution, completionByTag } = useMemo(
    () => computeAnalytics(todos),
    [todos]
  )

  // useCallback: sort handler — stable identity, safe for child memo
  const handleSortDate = useCallback(() => setSort("date"), [setSort])
  const handleSortPriority = useCallback(() => setSort("priority"), [setSort])
  const handleFilterAll = useCallback(() => setFilterTag(null), [setFilterTag])

  return (
    <div className="space-y-6 p-4 bg-card rounded-lg border border-border">
      {/* Priority distribution */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Priority Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(priorityDistribution).map(([priority, count]) => (
            <div key={priority} className="text-center p-3 bg-background rounded-lg">
              <div className="text-2xl font-bold capitalize text-primary">{count}</div>
              <div className="text-xs text-muted-foreground capitalize">{priority}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sort options */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Sort Options</h3>
        <div className="flex gap-2">
          <button
            onClick={handleSortDate}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              sortBy === "date"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            Sort by Date
          </button>
          <button
            onClick={handleSortPriority}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              sortBy === "priority"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            Sort by Priority
          </button>
        </div>
      </div>

      {/* Tag filters */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Filter by Tags</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleFilterAll}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filterTag === null
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            All
          </button>
          {Object.entries(allTags).map(([tag, count]) => (
            // TagButton extracted inline — each tag gets its own stable callback via useMemo key
            <TagFilterButton
              key={tag}
              tag={tag}
              count={count}
              active={filterTag === tag}
              onFilter={setFilterTag}
            />
          ))}
        </div>
      </div>

      {/* Completion by tag */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Completion Rate by Tag</h3>
        <div className="space-y-2">
          {Object.entries(completionByTag).map(([tag, percentage]) => (
            <div key={tag} className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-20">{tag}</span>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-foreground w-12">{percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

/**
 * TagFilterButton — memoised sub-component.
 * Isolates the useCallback per-tag so the parent doesn't create inline handlers.
 */
interface TagFilterButtonProps {
  tag: string
  count: number
  active: boolean
  onFilter: (tag: string | null) => void
}

const TagFilterButton = memo(function TagFilterButton({ tag, count, active, onFilter }: TagFilterButtonProps) {
  const handleClick = useCallback(() => onFilter(tag), [onFilter, tag])
  return (
    <button
      onClick={handleClick}
      className={`px-3 py-1 rounded-full text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-background text-foreground hover:bg-muted"
      }`}
    >
      {tag} ({count})
    </button>
  )
})

export default TodoAnalytics
