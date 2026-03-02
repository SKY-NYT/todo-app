import { memo, useCallback, useMemo } from "react";
import DOMPurify from "dompurify";
import { Button } from "@/components/atoms/button";
import type { Todo } from "@/types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const PRIORITY_COLOR: Record<Todo["priority"], string> = {
  high: "text-destructive",
  medium: "text-orange-600",
  low: "text-blue-600",
};

const TodoItem = memo(function TodoItem({
  todo,
  onToggle,
  onDelete,
}: TodoItemProps) {
  const handleToggle = useCallback(
    () => onToggle(todo.id),
    [onToggle, todo.id],
  );
  const handleDelete = useCallback(
    () => onDelete(todo.id),
    [onDelete, todo.id],
  );
  const safeText = useMemo(() => DOMPurify.sanitize(todo.text), [todo.text]);

  return (
    <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:bg-muted transition-colors">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        className="w-5 h-5 accent-primary rounded"
        aria-label={`Toggle: ${safeText}`}
      />
      <div className="flex-1">
        <span
          className={`block ${todo.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
        >
          {safeText}
        </span>
        <div className="flex gap-2.5 mt-1 flex-wrap">
          <span
            className={`text-xs font-semibold ${PRIORITY_COLOR[todo.priority]}`}
          >
            {todo.priority.toUpperCase()}
          </span>
          {todo.tags.map((tag, index) => (
            <span
              key={`${todo.id}-${tag}-${index}`}
              className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        className="text-destructive hover:bg-destructive/10"
        aria-label={`Delete: ${safeText}`}
      >
        Delete
      </Button>
    </div>
  );
});

export default TodoItem;
