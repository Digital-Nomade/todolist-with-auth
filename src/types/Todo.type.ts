/** An ISO-8601 DateTime string returned by or sent to GraphQL. */
export type TodoDateTime = string

export interface AddTodo {
  title: string
  description: string
  dueTo?: TodoDateTime | null
  reminderOn?: TodoDateTime | null
}

export interface Todo {
  id: string
  title: string
  description: string
  done: boolean
  dueTo: TodoDateTime | null
  reminderOn: TodoDateTime | null
  createdAt: TodoDateTime
  updatedAt: TodoDateTime
}

export interface UpdateTodo {
  id: string
  input: {
    title?: string | null
    description?: string | null
    done?: boolean | null
    dueTo?: TodoDateTime | null
    reminderOn?: TodoDateTime | null
  }
}

export interface TodoPagination {
  currentPage?: number
  limit?: number
  orderBy?: "ASC" | "DESC"
  total?: boolean
}

export interface PaginatedTodo {
  data: Todo[]
  first: number
  last: number
  limit: number
  total: number | null
}