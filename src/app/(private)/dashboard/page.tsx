"use client"

import { TodosList } from "@/components/feats/dashboard/todos-list/TodosList"
import { TodoDetail } from "@/components/organism"
import { useOfflineTodos } from "@/lib/features/todos/offline/hooks"
import { useSearchTodosQuery } from "@/lib/features/todos/todoApi"
import { Todo } from "@/types/Todo.type"
import { skipToken } from "@reduxjs/toolkit/query"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

export default function Dashboard() {
  const searchTerm = useSearchParams().get("search")?.trim() ?? ""
  const offlineTodos = useOfflineTodos()
  const remoteSearch = useSearchTodosQuery(
    searchTerm && !offlineTodos.localOnly
      ? {
          pagination: { currentPage: 1, limit: 50, orderBy: "DESC" },
          term: searchTerm,
        }
      : skipToken,
  )
  const localSearchData = useMemo(() => {
    if (!searchTerm || !offlineTodos.localOnly) return null
    const data = offlineTodos.data.data.filter(todo => {
          const normalizedTerm = searchTerm.toLocaleLowerCase()
          return todo.title.toLocaleLowerCase().includes(normalizedTerm)
            || todo.description.toLocaleLowerCase().includes(normalizedTerm)
        })
    return {
      data,
      first: data.length ? 1 : 0,
      last: data.length,
      limit: data.length,
      total: data.length,
    }
  }, [offlineTodos.data, offlineTodos.localOnly, searchTerm])
  const todosData = searchTerm
    ? localSearchData ?? remoteSearch.data
    : offlineTodos.data
  const error = searchTerm && !offlineTodos.localOnly
    ? remoteSearch.error
    : offlineTodos.error
  const isLoading = offlineTodos.isLoading
    || Boolean(searchTerm && !offlineTodos.localOnly && remoteSearch.isLoading)
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

  if (error && !todosData?.data.length) {
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
                paginatedTodos={todosData ?? {
                  data: [],
                  first: 0,
                  last: 0,
                  limit: 0,
                  total: 0,
                }}
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