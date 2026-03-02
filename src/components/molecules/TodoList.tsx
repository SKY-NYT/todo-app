import { memo, useMemo, useCallback } from "react"
import { FixedSizeList, type ListChildComponentProps } from "react-window"
import TodoItem from "./TodoItem"
import { useTodos } from "@/context/TodoContext"
import type { Todo } from "@/types/todo"

const ITEM_HEIGHT = 72   // px — matches p-3 card height
const LIST_HEIGHT = 480  // px — visible window before scrolling kicks in

/**
 * VirtualRow — rendered by react-window for each visible row.
 * Must be memoised: FixedSizeList calls it on every scroll event.
 */
interface RowData {
  items: Todo[]
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

const VirtualRow = memo(function VirtualRow({ index, style, data }: ListChildComponentProps<RowData>) {
  const { items, onToggle, onDelete } = data
  const todo = items[index]
  return (
    <div style={style} className="px-0 py-1">
      <TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />
    </div>
  )
})

/**
 * TodoList — consumes filteredSortedTodos from context (already memoised).
 * Uses react-window FixedSizeList so only ~7 DOM nodes exist at once,
 * regardless of whether there are 50 or 5 000 todos.
 *
 * React.memo on TodoList itself prevents re-renders when unrelated
 * context slices (e.g. searchQuery keystroke) don't change filteredSortedTodos.
 */
const TodoList = memo(function TodoList() {
  const { filteredSortedTodos, todos, toggleTodo, deleteTodo } = useTodos()

  // Split active / completed — useMemo so it only reruns on list change
  const { incompleteTodos, completedTodos } = useMemo(() => ({
    incompleteTodos: filteredSortedTodos.filter((t) => !t.completed),
    completedTodos: filteredSortedTodos.filter((t) => t.completed),
  }), [filteredSortedTodos])

  // Stable itemData objects — avoids FixedSizeList re-rendering all rows
  const activeItemData = useMemo<RowData>(
    () => ({ items: incompleteTodos, onToggle: toggleTodo, onDelete: deleteTodo }),
    [incompleteTodos, toggleTodo, deleteTodo]
  )

  const completedItemData = useMemo<RowData>(
    () => ({ items: completedTodos, onToggle: toggleTodo, onDelete: deleteTodo }),
    [completedTodos, toggleTodo, deleteTodo]
  )

  // Stable key extractor
  const itemKey = useCallback((index: number, data: RowData) => data.items[index].id, [])

  const activeHeight = Math.min(incompleteTodos.length * ITEM_HEIGHT, LIST_HEIGHT)
  const completedHeight = Math.min(completedTodos.length * ITEM_HEIGHT, LIST_HEIGHT)

  return (
    <div className="space-y-4">
      {/* Active todos */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-3">
          Active ({incompleteTodos.length})
        </h2>
        {incompleteTodos.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No active todos</p>
          </div>
        ) : (
          <FixedSizeList
            height={activeHeight}
            itemCount={incompleteTodos.length}
            itemSize={ITEM_HEIGHT}
            width="100%"
            itemData={activeItemData}
            itemKey={itemKey}
          >
            {VirtualRow}
          </FixedSizeList>
        )}
      </div>

      {/* Completed todos */}
      {completedTodos.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Completed ({completedTodos.length})
          </h2>
          <FixedSizeList
            height={completedHeight}
            itemCount={completedTodos.length}
            itemSize={ITEM_HEIGHT}
            width="100%"
            itemData={completedItemData}
            itemKey={itemKey}
          >
            {VirtualRow}
          </FixedSizeList>
        </div>
      )}

      {/* Empty state */}
      {todos.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No todos yet. Add one to get started!</p>
        </div>
      )}
    </div>
  )
})

export default TodoList
