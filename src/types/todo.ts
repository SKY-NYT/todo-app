export type Priority = "low" | "medium" | "high"
export type SortBy = "date" | "priority"

export interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: number
  priority: Priority
  tags: string[]
}

export interface TodoStats {
  total: number
  completed: number
  pending: number
  completionPercentage: number
  highCount: number
  mediumCount: number
  lowCount: number
}

export interface AnalyticsData {
  allTags: Record<string, number>
  priorityDistribution: { low: number; medium: number; high: number }
  completionByTag: Record<string, number>
}
