'use client'

import { TodosList } from "@/components/feats/dashboard/todos-list/TodosList"
import { TodoDetail } from "@/components/organism"
import { useListTodosQuery } from "@/lib/features/todos/todoApi"
import { Todo } from "@/types/Todo.type"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const { data: todosData } = useListTodosQuery(null)
  const [todos, setTodos] = useState<Todo[]>([])
  const [selectedTodo, setSelectedTodo] = useState<Todo>()
  const [todoIndex, setTodoIndex] = useState(0)

  useEffect(() => {
    if (todosData && todosData.data.length) {
      setTodos(todosData.data)
      setSelectedTodo(todosData.data[0])
    }
  }, [])

  function handleSelectTodo(todo: Todo) {
    setSelectedTodo(todo)

    const tIndex = todosData?.data.findIndex(t => t.id === todo.id)
    console.log(tIndex)
    if (tIndex !== undefined) {
      console.log(tIndex)
      setTodoIndex(tIndex)
    }
  }

  return (
    <main  className="max-w-[1284px] mx-auto w-full flex flex-col h-full">
      <div className="flex justify-between w-full pt-8 px-8 h-fit flex-1 pb-8">
        <section className=" border-r-1 pr-4 w-full max-w-[300px] flex flex-col flex-1 h-full">
          {
            todos.length && selectedTodo && (
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