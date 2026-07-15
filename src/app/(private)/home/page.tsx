"use client"

import { TodoDetail } from "@/components/organism/todo-detail/TodoDetail";
import { useListTodosQuery } from "@/lib/features/todos/todoApi";
import { Todo } from "@/types/Todo.type";
import { useState } from "react";

export default function HomePage() {
  const { data: todosData, isError, isLoading } = useListTodosQuery()
  const [selectedTodo, setSelectedTodo] = useState<Todo>()

  if (isLoading) {
    return <main className='p-8'>Loading todos…</main>
  }

  if (isError) {
    return <main className='p-8'>Unable to load todos.</main>
  }

  return (
    <main className='p-8 flex flex-1 w-full'>
      <TodoDetail
        paginatedTodos={todosData}
        selectedTodo={selectedTodo}
        onSelectTodo={setSelectedTodo}
        tIndex={0}
      />
    </main>
  )
}
