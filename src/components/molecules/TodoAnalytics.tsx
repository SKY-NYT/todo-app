import { memo, useCallback } from "react";
import { useTodoStore } from "@/store/useTodoStore";
import { useShallow } from "zustand/react/shallow";


const PriorityDistribution = memo(function PriorityDistribution() {
  const dist = useTodoStore(
    useShallow((s) =>
      s.todos.reduce(
        (acc, t) => {
          acc[t.priority]++;
          return acc;
        },
        { low: 0, medium: 0, high: 0 },
      ),
    ),
  );

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-3">
        Priority Distribution
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {(["high", "medium", "low"] as const).map((p) => (
          <div key={p} className="text-center p-3 bg-background rounded-lg">
            <div className="text-2xl font-bold capitalize text-primary">
              {dist[p]}
            </div>
            <div className="text-xs text-muted-foreground capitalize">{p}</div>
          </div>
        ))}
      </div>
    </div>
  );
});


const SortOptions = memo(function SortOptions() {
  const sortBy = useTodoStore((s) => s.sortBy);
  const setSort = useTodoStore((s) => s.setSort);

  const handleDate = useCallback(() => setSort("date"), [setSort]);
  const handlePriority = useCallback(() => setSort("priority"), [setSort]);

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-3">
        Sort Options
      </h3>
      <div className="flex gap-2">
        <button
          onClick={handleDate}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            sortBy === "date"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border bg-background text-foreground hover:bg-muted"
          }`}
        >
          Sort by Date
        </button>
        <button
          onClick={handlePriority}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            sortBy === "priority"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border bg-background text-foreground hover:bg-muted"
          }`}
        >
          Sort by Priority
        </button>
      </div>
    </div>
  );
});


const TagFilter = memo(function TagFilter() {
  const filterTag = useTodoStore((s) => s.filterTag);
  const setFilterTag = useTodoStore((s) => s.setFilterTag);
  const allTags = useTodoStore(
    useShallow((s) =>
      s.todos.reduce<Record<string, number>>((acc, t) => {
        t.tags.forEach((tag) => {
          acc[tag] = (acc[tag] ?? 0) + 1;
        });
        return acc;
      }, {}),
    ),
  );

  const handleAll = useCallback(() => setFilterTag(null), [setFilterTag]);

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-3">
        Filter by Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleAll}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filterTag === null
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-background text-foreground hover:bg-muted"
          }`}
        >
          All
        </button>
        {Object.entries(allTags).map(([tag, count]) => (
          <TagFilterButton
            key={tag}
            tag={tag}
            count={count}
            active={filterTag === tag}
            onFilter={setFilterTag}
          />
        ))}
      </div>
    </div>
  );
});


const CompletionByTag = memo(function CompletionByTag() {
  const completionByTag = useTodoStore(
    useShallow((s) => {
      const tagSet = new Set(s.todos.flatMap((t) => t.tags));
      const result: Record<string, number> = {};
      for (const tag of tagSet) {
        const tagged = s.todos.filter((t) => t.tags.includes(tag));
        const done = tagged.filter((t) => t.completed).length;
        result[tag] =
          tagged.length > 0 ? Math.round((done / tagged.length) * 100) : 0;
      }
      return result;
    }),
  );

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-3">
        Completion Rate by Tag
      </h3>
      <div className="space-y-2">
        {Object.entries(completionByTag).map(([tag, percentage]) => (
          <div key={tag} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-20">{tag}</span>
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-foreground w-12">
              {percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});



interface TagFilterButtonProps {
  tag: string;
  count: number;
  active: boolean;
  onFilter: (tag: string | null) => void;
}

const TagFilterButton = memo(function TagFilterButton({
  tag,
  count,
  active,
  onFilter,
}: TagFilterButtonProps) {
  const handleClick = useCallback(() => onFilter(tag), [onFilter, tag]);
  return (
    <button
      onClick={handleClick}
      className={`px-3 py-1 rounded-full text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-background text-foreground hover:bg-muted"
      }`}
    >
      {tag} ({count})
    </button>
  );
});



const TodoAnalytics = memo(function TodoAnalytics() {
  return (
    <div className="space-y-6 p-4 bg-card rounded-lg border border-border">
      <PriorityDistribution />
      <SortOptions />
      <TagFilter />
      <CompletionByTag />
    </div>
  );
});

export default TodoAnalytics;
