import { Suspense } from "react"
import { TodoProvider } from "@/context/TodoContext"
import TodoForm from "@/components/molecules/TodoForm"
import SearchBox from "@/components/molecules/SearchBox"
import Stats from "@/components/molecules/Stats"
import { LazyTodoList, LazyTodoAnalytics } from "@/components/molecules/lazyComponents"
import { ListSkeleton, AnalyticsSkeleton } from "@/components/molecules/Skeletons"

export function TodoApp() {
  return (
    <TodoProvider>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">My Todo App</h1>
          </header>

          <div className="space-y-6">
           
            <TodoForm />
            <SearchBox />
            <Stats />

            
            <Suspense fallback={<AnalyticsSkeleton />}>
              <LazyTodoAnalytics />
            </Suspense>

            <Suspense fallback={<ListSkeleton rows={8} />}>
              <LazyTodoList />
            </Suspense>
          </div>
        </div>
      </div>
    </TodoProvider>
  )
}
