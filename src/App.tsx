import { ThemeProvider } from "@/context/theme-provider"
import { Layout } from "@/components/templates/layout"
import { TodoApp } from "@/components/organisms/TodoApp"

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="todo-ui-theme">
      <Layout>
        <TodoApp />
      </Layout>
    </ThemeProvider>
  )
}

export default App
