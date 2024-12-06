export interface AddTodo {
  title: string
  description: string
  dueTo: Date | null
  reminderOn: Date | null
}

export interface Todo {
  id: string
  title: string
  description: string
  done: boolean
  dueTo: Date | null
  reminderOn: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface PaginatedTodo {
  data: Todo[]
  first: number
  last: number
  limit: number
}