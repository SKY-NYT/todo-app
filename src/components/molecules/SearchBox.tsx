import { memo, useCallback } from "react";
import { useTodoStore } from "@/store/useTodoStore";

const SearchBox = memo(function SearchBox() {
  // Granular selectors: changing sortBy/filterTag/todos won't re-render this
  const searchQuery = useTodoStore((s) => s.searchQuery);
  const setSearch = useTodoStore((s) => s.setSearch);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    [setSearch],
  );

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={searchQuery}
        onChange={handleChange}
        placeholder="Search todos..."
        className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
        aria-label="Search todos"
      />
    </div>
  );
});

export default SearchBox;
