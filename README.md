# Todo App — Optimisation Walkthrough (Tasks 1–4)

> React 19 · Vite 6 · Tailwind CSS v4 · TypeScript · Vitest

---

## 🚀 Quick Start

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # run all tests (Vitest)
npm run test:ui      # Vitest browser UI
npm run test:coverage
```

---

## 📁 Final Folder Structure

```
src/
├── App.tsx                         # Root: ThemeProvider → Layout → TodoApp
├── index.css                       # Tailwind v4 CSS-first + OKLCH design tokens
├── main.tsx
│
├── types/
│   └── todo.ts                     # Shared Todo, Priority, SortBy, Stats types
│
├── utils/
│   └── todoUtils.ts                # Pure functions: filter, sort, stats, analytics
│
├── context/
│   ├── theme-provider.tsx          # Light/dark theme context
│   └── TodoContext.tsx             # useReducer + useCallback + useMemo store
│
├── hooks/
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── components/
│   ├── atoms/                      # 57 shadcn/ui primitive components
│   ├── molecules/
│   │   ├── SearchBox.tsx           ✅ React.memo, context-connected
│   │   ├── Stats.tsx               ✅ React.memo, useMemo stats
│   │   ├── TodoAnalytics.tsx       ✅ React.memo, useMemo analytics
│   │   ├── TodoForm.tsx            ✅ Functional (was class), React.memo
│   │   ├── TodoItem.tsx            ✅ React.memo, useCallback, DOMPurify XSS
│   │   ├── TodoList.tsx            ✅ React.memo, react-window virtualisation
│   │   ├── lazyComponents.ts       ✅ React.lazy exports
│   │   └── Skeletons.tsx           ✅ Suspense fallback skeletons
│   ├── organisms/
│   │   ├── TodoApp.tsx             ✅ Functional, TodoProvider, Suspense
│   │   └── page.tsx
│   └── templates/
│       └── layout.tsx
│
└── tests/
    ├── setup.ts                    # jest-dom extensions
    ├── todoUtils.test.ts           # Pure function unit tests
    ├── todoReducer.test.ts         # Reducer isolation tests
    ├── components.test.tsx         # Component integration tests
    └── useTodos.test.tsx           # Hook tests + stable-ref assertions
```

---

## 🔄 Task 1 — Baseline Diagnosis

### Anti-patterns identified

| # | Anti-pattern | Location |
|---|---|---|
| 1 | Monolithic class component — every setState re-renders all 50+ children | `TodoApp` |
| 2 | Prop drilling — `Stats` received `onToggle`/`onDelete` it never used | All children |
| 3 | Direct state mutation — `push()` into existing array before setState | `addTodo` |
| 4 | No `React.memo` on any leaf component | All molecules |
| 5 | Inline arrow functions in JSX break memo reference equality | `TodoItem`, `TodoList` |
| 6 | Expensive filter/sort/reduce on every render, no `useMemo` | `TodoList`, `Stats`, `TodoAnalytics` |
| 7 | Class component for a two-field form | `TodoForm` |
| 8 | Unstable list keys (`incomplete-${id}` flips on toggle) | `TodoList` |

---

## ⚡ Task 2 — Rendering Optimisation & State Refactor

### React.memo

Every presentational molecule is wrapped with `React.memo`:

```tsx
// Before
export default function TodoItem({ todo, onToggle, onDelete }) { ... }

// After
const TodoItem = memo(function TodoItem({ todo, onToggle, onDelete }) { ... })
export default TodoItem
```

**Effect:** With 50 todos, toggling one now re-renders **1 TodoItem** instead of **50**.

---

### useCallback — stable handler references

All action dispatchers in `TodoContext` use `useCallback(fn, [])`:

```tsx
const addTodo = useCallback((text: string, priority: Priority) => {
  dispatch({ type: "ADD_TODO", text, priority })
}, [])  // stable forever — dispatch never changes
```

Per-item handlers in `TodoItem` are also memoised:

```tsx
const handleToggle = useCallback(() => onToggle(todo.id), [onToggle, todo.id])
const handleDelete = useCallback(() => onDelete(todo.id), [onDelete, todo.id])
```

Without `useCallback`, `React.memo` equality checks always fail because each render creates a new function reference.

---

### useMemo — cached derived state

| Calculation | Before | After |
|---|---|---|
| Filtered + sorted list | Every render | `useMemo([todos, searchQuery, filterTag, sortBy])` |
| Stats (total, %, priority counts) | 4 filter passes per render | `useMemo([todos, searchQuery])` |
| Analytics (tags, distribution) | 3 reduce passes per render | `useMemo([todos])` |
| Active/completed split | 2 filter passes per render | `useMemo([filteredSortedTodos])` |

---

### TodoProvider — eliminates prop drilling

**Before:**
```tsx
<Stats todos={...} onToggle={...} onDelete={...} searchQuery={...} />
//                 ↑ onToggle/onDelete never used by Stats
```

**After:** Each component reads exactly what it needs:
```tsx
// Stats reads only two slices
const { todos, searchQuery } = useTodos()

// SearchBox reads only two slices
const { searchQuery, setSearch } = useTodos()
```

Context is backed by `useReducer` with a pure reducer — immutable state transitions, fully unit-testable without React.

---

## 🔀 Task 3 — Code-Splitting, Virtualisation & Security

### React.lazy + Suspense

The two heaviest components are lazy-loaded — their JS chunks are only fetched when the component first renders:

```ts
// lazyComponents.ts
export const LazyTodoList      = lazy(() => import("@/components/molecules/TodoList"))
export const LazyTodoAnalytics = lazy(() => import("@/components/molecules/TodoAnalytics"))
```

```tsx
// TodoApp.tsx
<Suspense fallback={<AnalyticsSkeleton />}>
  <LazyTodoAnalytics />
</Suspense>

<Suspense fallback={<ListSkeleton rows={7} />}>
  <LazyTodoList />
</Suspense>
```

Skeleton fallbacks use `animate-pulse` to keep the UI stable during loading.

---

### react-window — list virtualisation

`FixedSizeList` renders only the visible rows (~7) regardless of list length:

```tsx
<FixedSizeList
  height={Math.min(incompleteTodos.length * 72, 480)}
  itemCount={incompleteTodos.length}
  itemSize={72}
  width="100%"
  itemData={activeItemData}    // stable useMemo object
  itemKey={(i, d) => d.items[i].id}
>
  {VirtualRow}
</FixedSizeList>
```

| | Before | After |
|---|---|---|
| DOM nodes (50 todos) | 50–55 | ~10 |
| Scroll performance | Degrades linearly | Constant O(1) |

---

### DOMPurify — XSS sanitisation

```tsx
// TodoItem.tsx
const safeText = DOMPurify.sanitize(todo.text)
return <span>{safeText}</span>
```

Two-layer defence:
- **`sanitizeText`** (storage layer in `todoUtils.ts`) — normalises whitespace before storing
- **`DOMPurify`** (display layer in `TodoItem`) — strips any HTML/script injection at render time

```
Input:  <script>alert("xss")</script>Safe text
Output: Safe text
```

---

## 🧩 Task 4 — Modularity, Reusability & Testability

### Component refactoring

| Component | Before | After |
|---|---|---|
| `TodoApp` | Class, 120 LOC, all state, prop drilling | Functional, 35 LOC, wraps `<TodoProvider>` |
| `TodoForm` | Class with `this.state` | Functional `useState` + `useCallback` |
| `TodoItem` | No memo, inline handlers | `React.memo`, `useCallback`, DOMPurify |
| `TodoList` | No memo, inline filtering | `React.memo`, `react-window`, context-connected |
| `Stats` | No memo, 4 filter passes per render | `React.memo`, `useMemo` |
| `TodoAnalytics` | No memo, 3 reduce passes | `React.memo`, `useMemo`, memoised `TagFilterButton` |
| `SearchBox` | Prop-drilled handler | `React.memo`, reads context directly |

---

### Pure utility layer

All data transformations live in `src/utils/todoUtils.ts` as pure functions — no React imports, no hooks, no side effects. This makes them testable with zero setup:

```ts
expect(filterTodos(todos, "buy", null)).toHaveLength(1)
expect(computeStats(todos).completionPercentage).toBe(33)
expect(sortTodos(todos, "priority")[0].priority).toBe("high")
```

---

### Test suite

| File | Scope | Tests |
|---|---|---|
| `todoUtils.test.ts` | Pure functions: filter, sort, stats, analytics, sanitize | 25 |
| `todoReducer.test.ts` | All 6 action types, immutability, edge cases | 18 |
| `components.test.tsx` | Render, events, memo, XSS, accessibility | 15 |
| `useTodos.test.tsx` | All actions, filter integration, **stable ref assertions** | 12 |

**Key stable reference test — verifies `useCallback` is working:**
```tsx
it("addTodo identity does not change between renders", () => {
  const { result, rerender } = renderHook(() => useTodos(), { wrapper })
  const firstRef = result.current.addTodo
  rerender()
  expect(result.current.addTodo).toBe(firstRef) // must be same object
})
```

---

## 📊 Performance Summary

| Metric | Baseline | Optimised |
|---|---|---|
| Re-renders on search keystroke | All 50+ components | SearchBox + Stats only |
| Re-renders on todo toggle | All 50+ components | 1 TodoItem |
| DOM nodes in list (50 todos) | 50–55 | ~10 |
| Analytics compute frequency | Every render | Only when todos changes |
| JS bundle (initial) | Single chunk | Core + 2 deferred chunks |
| XSS protection | None | DOMPurify + whitespace normalisation |

---

## 📦 New Dependencies (v1.0.0 → v1.1.0)

| Package | Purpose |
|---|---|
| `dompurify` | XSS sanitisation |
| `react-window` | List virtualisation |
| `@types/dompurify` | TypeScript types |
| `@types/react-window` | TypeScript types |
| `vitest` | Test runner |
| `@testing-library/react` | Component testing |
| `@testing-library/user-event` | User interaction simulation |
| `@testing-library/jest-dom` | DOM matchers |
| `@vitest/coverage-v8` | Coverage reporting |
| `jsdom` | DOM environment for Vitest |
