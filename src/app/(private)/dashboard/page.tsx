"use client"

import { TodosList } from "@/components/feats/dashboard/todos-list/TodosList"
import { TodoDetail } from "@/components/organism"
import { useOfflineTodos } from "@/lib/features/todos/offline/hooks"
import { Todo } from "@/types/Todo.type"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const { data: todosData, error, isLoading } = useOfflineTodos()
  const [todos, setTodos] = useState<Todo[]>([])
  const [selectedTodo, setSelectedTodo] = useState<Todo>()
  const [todoIndex, setTodoIndex] = useState(0)

  useEffect(() => {
    const nextTodos = todosData?.data ?? []
    setTodos(nextTodos)
    setSelectedTodo(current =>
      nextTodos.find(todo => todo.id === current?.id) ?? nextTodos[0]
    )
  }, [todosData])

  function handleSelectTodo(todo: Todo) {
    setSelectedTodo(todo)
    const tIndex = todosData?.data.findIndex(t => t.id === todo.id)

    if (tIndex !== undefined && tIndex >= 0) {
      setTodoIndex(tIndex)
    }
  }

  if (isLoading) {
    return <main className="p-8">Loading todos…</main>
  }

  if (error && !todosData.data.length) {
    return <main className="p-8">Unable to load todos.</main>
  }

  return (
    <main  className="max-w-[1284px] mx-auto w-full flex flex-col h-full">
      <div className="flex justify-between w-full pt-8 px-8 h-fit flex-1 pb-8">
        <section className=" border-r-1 pr-4 w-full max-w-[300px] flex flex-col flex-1 h-full">
          {
            todos.length > 0 && selectedTodo && (
              <TodosList
                handleSelectTodo={handleSelectTodo}
                selectedTodoId={selectedTodo.id}
                todos={todos}
              />
            )
          }
        </section>
        <section className="flex flex-1 px-4">
          {
            selectedTodo 
            ? (
              <TodoDetail
                selectedTodo={selectedTodo}
                paginatedTodos={todosData}
                onSelectTodo={setSelectedTodo}
                tIndex={todoIndex}
              />
            )
            : (
              <p>No Todo</p>
            )
          }
        </section>
      </div>
    </main>
  )
}