'use client'

import { TodoDetail } from "@/components/organism/todo-detail/TodoDetail";
import { useListTodosQuery } from "@/lib/features/todos/todoApi";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { PaginatedTodo, Todo } from "@/types/Todo.type";
import { useEffect, useState } from "react";

export default function HomePage() {
  const dispatch = useAppDispatch()
  const { toggleAddTodoModal } = useAppSelector(state => state.todo)
  const { data: todosData, isSuccess } = useListTodosQuery(null)
  const [selectedTodo, setSelectedTodo] = useState<Todo>()
  const [paginatedTodos, setPaginatedTodos] = useState<PaginatedTodo>()

  useEffect(() => {
    if (todosData?.data && !isSuccess) {
      const filteredData = todosData?.data.filter(todo => !todo.done)
      
      setPaginatedTodos({
        ...todosData,
        data: filteredData,
      })
    }
  }, [paginatedTodos])

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
