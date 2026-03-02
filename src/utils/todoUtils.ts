import type { Todo, Priority, SortBy, TodoStats, AnalyticsData } from "@/types/todo"

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 }


export function filterTodos(todos: Todo[], searchQuery: string, filterTag: string | null): Todo[] {
  const query = searchQuery.toLowerCase()
  return todos.filter((todo) => {
    const matchesSearch = query === "" || todo.text.toLowerCase().includes(query)
    const matchesTag = filterTag === null || todo.tags.includes(filterTag)
    return matchesSearch && matchesTag
  })
}


export function sortTodos(todos: Todo[], sortBy: SortBy): Todo[] {
  return [...todos].sort((a, b) =>
    sortBy === "priority"
      ? PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      : b.createdAt - a.createdAt
  )
}


export function computeStats(todos: Todo[]): TodoStats {
  const stats = {
    total: todos.length,
    completed: 0,
    pending: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    completionPercentage: 0,
  };

  for (const todo of todos) {

    if (todo.completed) {
      stats.completed++;
    } else {
      stats.pending++;
    }

    
    if (todo.priority === "high") stats.highCount++;
    else if (todo.priority === "medium") stats.mediumCount++;
    else if (todo.priority === "low") stats.lowCount++;
  }

  stats.completionPercentage = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  return stats;
}

export function computeAnalytics(todos: Todo[]): AnalyticsData {
  const allTags = todos.reduce<Record<string, number>>((acc, todo) => {
    todo.tags.forEach((tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1
    })
    return acc
  }, {})

  const priorityDistribution = todos.reduce(
    (acc, todo) => {
      acc[todo.priority] = (acc[todo.priority] ?? 0) + 1
      return acc
    },
    { low: 0, medium: 0, high: 0 }
  )

  const completionByTag = Object.keys(allTags).reduce<Record<string, number>>((acc, tag) => {
    const tagTodos = todos.filter((t) => t.tags.includes(tag))
    const done = tagTodos.filter((t) => t.completed).length
    acc[tag] = tagTodos.length > 0 ? Math.round((done / tagTodos.length) * 100) : 0
    return acc
  }, {})

  return { allTags, priorityDistribution, completionByTag }
}


export function generateInitialTodos(): Todo[] {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    text: `Todo item ${i + 1}`,
    completed: Math.random() > 0.7,
    createdAt: Date.now() - Math.random() * 1_000_000,
    priority: (["low", "medium", "high"] as Priority[])[Math.floor(Math.random() * 3)],
    tags: [`tag${Math.floor(Math.random() * 5)}`, `tag${Math.floor(Math.random() * 5)}`],
  }))
}


export function sanitizeText(raw: string): string {
  return raw.trim().replace(/\s+/g, " ")
}
