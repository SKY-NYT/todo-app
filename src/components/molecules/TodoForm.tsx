import { memo, useState, useCallback } from "react"
import { Button } from "@/components/atoms/button"
import { useTodoStore } from "@/store/useTodoStore"
import type { Priority } from "@/types/todo"


const TodoForm = memo(function TodoForm() {
  const { addTodo } = useTodoStore()
  const [inputValue, setInputValue] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handlePriorityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriority(e.target.value as Priority)
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (inputValue.trim()) {
        addTodo(inputValue, priority)
        setInputValue("")
        setPriority("medium")
      }
    },
    [addTodo, inputValue, priority]
  )

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <select
        value={priority}
        onChange={handlePriorityChange}
        className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
        aria-label="Todo priority"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Add a new todo..."
        className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
        aria-label="New todo text"
      />
      <Button type="submit" className="bg-primary text-primary-foreground">
        Add
      </Button>
    </form>
  )
})

export default TodoForm
