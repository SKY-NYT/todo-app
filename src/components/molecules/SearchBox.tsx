import { memo } from "react"
import { useTodos } from "@/context/TodoContext"


const SearchBox = memo(function SearchBox() {
  const { searchQuery, setSearch } = useTodos()

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search todos..."
        className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
        aria-label="Search todos"
      />
    </div>
  )
})

export default SearchBox
