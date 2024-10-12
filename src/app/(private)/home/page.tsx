'use client'
import { TodoDetail } from "@/components/organism/todo-detail/TodoDetail";
import { Todo } from "@/types/Todo";
import { useEffect, useState } from "react";
import { mockTodos } from "./mockData";

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>()

  useEffect(() => {
    setTimeout(() => {
      setTodos(mockTodos)
    }, 1500)
  }, [])

  return (
    <main className='p-8'>
      <TodoDetail
        todos={todos}
      />
    </main>
  )
}
