"use client"

import { TodoDetail } from "@/components/organism/todo-detail/TodoDetail";
import { useOfflineTodos } from "@/lib/features/todos/offline/hooks";
import { Todo } from "@/types/Todo.type";
import { useState } from "react";

export default function HomePage() {
  const { data: todosData, error, isLoading } = useOfflineTodos()
  const [selectedTodo, setSelectedTodo] = useState<Todo>()

  if (isLoading) {
    return <main className='p-8'>Loading todos…</main>
  }

  if (error && !todosData.data.length) {
    return <main className='p-8'>Unable to load todos.</main>
  }

  return (
    <main className='p-8 flex flex-1 w-full min-h-0'>
      <TodoDetail
        paginatedTodos={todosData}
        selectedTodo={selectedTodo}
        onSelectTodo={setSelectedTodo}
        tIndex={0}
      />
    </main>
  )
}
