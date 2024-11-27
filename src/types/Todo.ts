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