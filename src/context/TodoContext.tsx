import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react"
import type { Priority, SortBy, Todo } from "@/types/todo"
import { filterTodos, generateInitialTodos, sanitizeText, sortTodos } from "@/utils/todoUtils"

// ─── State shape ────────────────────────────────────────────────────────────

interface TodoState {
  todos: Todo[]
  nextId: number
  searchQuery: string
  sortBy: SortBy
  filterTag: string | null
}

// ─── Actions ────────────────────────────────────────────────────────────────

type TodoAction =
  | { type: "ADD_TODO"; text: string; priority: Priority }
  | { type: "TOGGLE_TODO"; id: number }
  | { type: "DELETE_TODO"; id: number }
  | { type: "SET_SEARCH"; query: string }
  | { type: "SET_SORT"; sortBy: SortBy }
  | { type: "SET_FILTER_TAG"; tag: string | null }

// ─── Reducer (pure — fully testable without React) ───────────────────────────

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case "ADD_TODO":
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: state.nextId,
            text: sanitizeText(action.text),
            completed: false,
            priority: action.priority,
            createdAt: Date.now(),
            tags: [],
          },
        ],
        nextId: state.nextId + 1,
      }

    case "TOGGLE_TODO":
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
        ),
      }

    case "DELETE_TODO":
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.id),
      }

    case "SET_SEARCH":
      return { ...state, searchQuery: action.query }

    case "SET_SORT":
      return { ...state, sortBy: action.sortBy }

    case "SET_FILTER_TAG":
      return { ...state, filterTag: action.tag }

    default:
      return state
  }
}

// ─── Initial state ───────────────────────────────────────────────────────────

function buildInitialState(): TodoState {
  return {
    todos: generateInitialTodos(),
    nextId: 51,
    searchQuery: "",
    sortBy: "date",
    filterTag: null,
  }
}

// ─── Context value shape ─────────────────────────────────────────────────────

export interface TodoContextValue {
  // Raw state
  todos: Todo[]
  searchQuery: string
  sortBy: SortBy
  filterTag: string | null

  // Derived / memoised data exposed as stable references
  filteredSortedTodos: Todo[]

  // Stable action handlers (useCallback — never change identity between renders)
  addTodo: (text: string, priority: Priority) => void
  toggleTodo: (id: number) => void
  deleteTodo: (id: number) => void
  setSearch: (query: string) => void
  setSort: (sortBy: SortBy) => void
  setFilterTag: (tag: string | null) => void
}

// ─── Context ─────────────────────────────────────────────────────────────────

const TodoContext = createContext<TodoContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, undefined, buildInitialState)

  // Stable action dispatchers — useCallback ensures identity is preserved
  const addTodo = useCallback((text: string, priority: Priority) => {
    dispatch({ type: "ADD_TODO", text, priority })
  }, [])

  const toggleTodo = useCallback((id: number) => {
    dispatch({ type: "TOGGLE_TODO", id })
  }, [])

  const deleteTodo = useCallback((id: number) => {
    dispatch({ type: "DELETE_TODO", id })
  }, [])

  const setSearch = useCallback((query: string) => {
    dispatch({ type: "SET_SEARCH", query })
  }, [])

  const setSort = useCallback((sortBy: SortBy) => {
    dispatch({ type: "SET_SORT", sortBy })
  }, [])

  const setFilterTag = useCallback((tag: string | null) => {
    dispatch({ type: "SET_FILTER_TAG", tag })
  }, [])

  // useMemo: only recomputes when todos / searchQuery / filterTag / sortBy change
  const filteredSortedTodos = useMemo(
    () => sortTodos(filterTodos(state.todos, state.searchQuery, state.filterTag), state.sortBy),
    [state.todos, state.searchQuery, state.filterTag, state.sortBy]
  )

  const value = useMemo<TodoContextValue>(
    () => ({
      todos: state.todos,
      searchQuery: state.searchQuery,
      sortBy: state.sortBy,
      filterTag: state.filterTag,
      filteredSortedTodos,
      addTodo,
      toggleTodo,
      deleteTodo,
      setSearch,
      setSort,
      setFilterTag,
    }),
    [
      state.todos,
      state.searchQuery,
      state.sortBy,
      state.filterTag,
      filteredSortedTodos,
      addTodo,
      toggleTodo,
      deleteTodo,
      setSearch,
      setSort,
      setFilterTag,
    ]
  )

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>
}

// ─── Public hook ─────────────────────────────────────────────────────────────

/**
 * useTodos — consume the TodoContext from any component in the tree.
 * Throws a clear error if used outside <TodoProvider>.
 */
export function useTodos(): TodoContextValue {
  const ctx = useContext(TodoContext)
  if (!ctx) throw new Error("useTodos must be used inside <TodoProvider>")
  return ctx
}
