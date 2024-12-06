import { api } from '@/lib/api';
import { AddTodo, PaginatedTodo, Todo } from '@/types/Todo.type';

const todoApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: build => ({
    addNewTodo: build.mutation({
      query: (todo: AddTodo) => ({
        url: '/todo',
        method: 'POST',
        body: {
          ...todo
        }
      }),
      invalidatesTags: ['todos']
    }),
    listTodos: build.query<PaginatedTodo, any>({
      query: () => ({
        url: '/todo',
        method: 'GET',
      }),
      transformResponse: (response: PaginatedTodo | any) => response as PaginatedTodo,
      providesTags: ['todos']
    }),
    updateTodos: build.mutation({
      query: (todo: Todo) => ({
        url: `/todo/${todo.id}`,
        method: 'PATCH',
        body: {
          ...todo
        },
      }),
      invalidatesTags: ['todos'],
    })
  })
})

export const {
  useListTodosQuery,
  useUpdateTodosMutation,
  useAddNewTodoMutation,
} = todoApi
