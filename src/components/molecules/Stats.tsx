import { memo, useMemo } from "react"
import { useTodoStore } from "@/store/useTodoStore"
import { computeStats } from "@/utils/todoUtils"
import { filterTodos } from "@/utils/todoUtils"


const Stats = memo(function Stats() {
  const { todos, searchQuery } = useTodoStore()

  
  const stats = useMemo(() => {
    const filtered = filterTodos(todos, searchQuery, null)
    return computeStats(filtered)
  }, [todos, searchQuery])

  const { total, completed, pending, completionPercentage, highCount, mediumCount, lowCount } = stats

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{completed}</div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600">{pending}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{completionPercentage}%</div>
          <div className="text-sm text-muted-foreground">Progress</div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-foreground">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div aria-label="Completion progress"
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
              role="progressbar"
              aria-valuenow={completionPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center">
            <div className="text-sm font-semibold text-destructive">{highCount}</div>
            <div className="text-xs text-muted-foreground">High</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-orange-600">{mediumCount}</div>
            <div className="text-xs text-muted-foreground">Medium</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-blue-600">{lowCount}</div>
            <div className="text-xs text-muted-foreground">Low</div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default Stats
