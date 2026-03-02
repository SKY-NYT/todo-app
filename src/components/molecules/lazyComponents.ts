
import { lazy } from "react"

export const LazyTodoList = lazy(() => import("@/components/molecules/TodoList"))
export const LazyTodoAnalytics = lazy(() => import("@/components/molecules/TodoAnalytics"))
