import { memo, useMemo, useCallback } from "react";
import { FixedSizeList, type ListChildComponentProps } from "react-window";
import TodoItem from "./TodoItem";
import { useFilteredSortedTodos, useTodoStore } from "@/store/useTodoStore";
import type { Todo } from "@/types/todo";

const ITEM_HEIGHT = 72;
const LIST_HEIGHT = 480;

interface RowData {
  items: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const VirtualRow = memo(function VirtualRow({
  index,
  style,
  data,
}: ListChildComponentProps<RowData>) {
  const { items, onToggle, onDelete } = data;
  const todo = items[index];
  return (
    <div style={style} className="px-0 py-1">
      <TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />
    </div>
  );
});

const TodoList = memo(function TodoList() {
  // useFilteredSortedTodos already applies search/filter/sort with useShallow
  // so this component only re-renders when the visible list actually changes.
  const todos = useFilteredSortedTodos();

  // Stable action references — Zustand actions never change identity
  const toggleTodo = useTodoStore((s) => s.toggleTodo);
  const deleteTodo = useTodoStore((s) => s.deleteTodo);

  const { incompleteTodos, completedTodos } = useMemo(
    () => ({
      incompleteTodos: todos.filter((t) => !t.completed),
      completedTodos: todos.filter((t) => t.completed),
    }),
    [todos],
  );

  const activeItemData = useMemo<RowData>(
    () => ({
      items: incompleteTodos,
      onToggle: toggleTodo,
      onDelete: deleteTodo,
    }),
    [incompleteTodos, toggleTodo, deleteTodo],
  );

  const completedItemData = useMemo<RowData>(
    () => ({
      items: completedTodos,
      onToggle: toggleTodo,
      onDelete: deleteTodo,
    }),
    [completedTodos, toggleTodo, deleteTodo],
  );

  const itemKey = useCallback(
    (index: number, data: RowData) => data.items[index].id,
    [],
  );

  const activeHeight = Math.min(
    incompleteTodos.length * ITEM_HEIGHT,
    LIST_HEIGHT,
  );
  const completedHeight = Math.min(
    completedTodos.length * ITEM_HEIGHT,
    LIST_HEIGHT,
  );

  return (
    <div className="space-y-4">
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

      {todos.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No todos yet. Add one to get started!
          </p>
        </div>
      )}
    </div>
  );
});

export default TodoList;
