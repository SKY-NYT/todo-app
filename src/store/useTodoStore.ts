import { useMemo } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { Priority, SortBy, Todo } from "@/types/todo";
import {
  computeStats,
  filterTodos,
  generateInitialTodos,
  sanitizeText,
  sortTodos,
} from "@/utils/todoUtils";

interface TodoStore {
  todos: Todo[];
  nextId: number;
  searchQuery: string;
  sortBy: SortBy;
  filterTag: string | null;

  addTodo: (text: string, priority: Priority) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  setSearch: (query: string) => void;
  setSort: (sortBy: SortBy) => void;
  setFilterTag: (tag: string | null) => void;
}

export const useTodoStore = create<TodoStore>((set) => ({
  todos: generateInitialTodos(),
  nextId: 51,
  searchQuery: "",
  sortBy: "date",
  filterTag: null,

  addTodo: (text, priority) =>
    set((state) => ({
      todos: [
        ...state.todos,
        {
          id: state.nextId,
          text: sanitizeText(text),
          completed: false,
          priority,
          createdAt: Date.now(),
          tags: [],
        },
      ],
      nextId: state.nextId + 1,
    })),

  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    })),

  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),

  setSearch: (query) => set({ searchQuery: query }),
  setSort: (sortBy) => set({ sortBy }),
  setFilterTag: (tag) => set({ filterTag: tag }),
}));

// useShallow performs element-by-element comparison on the returned array so the
// subscriber only re-renders when the actual list contents change, not on every
// unrelated store update.
export const useFilteredSortedTodos = () =>
  useTodoStore(
    useShallow((state) =>
      sortTodos(
        filterTodos(state.todos, state.searchQuery, state.filterTag),
        state.sortBy,
      ),
    ),
  );

// Individual selectors → only re-subscribes Stats when todos or searchQuery change.
// useMemo ensures computeStats only runs when those two values actually change.
export const useTodoStats = () => {
  const todos = useTodoStore((s) => s.todos);
  const searchQuery = useTodoStore((s) => s.searchQuery);
  return useMemo(
    () => computeStats(filterTodos(todos, searchQuery, null)),
    [todos, searchQuery],
  );
};
