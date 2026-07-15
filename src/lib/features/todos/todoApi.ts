import {
  CreateTodoDocument,
  DeleteTodoDocument,
  TodoDocument,
  TodosDocument,
  UpdateTodoDocument,
  type CreateTodoMutation,
  type CreateTodoMutationVariables,
  type DeleteTodoMutation,
  type TodoQuery,
  type TodosQueryVariables,
  type TodosQuery,
  type UpdateTodoMutation,
  type UpdateTodoMutationVariables,
} from "@/gql/graphql";
import { api, type GraphqlApiError } from "@/lib/api";
import type {
  AddTodo,
  PaginatedTodo,
  Todo,
  TodoPagination,
  UpdateTodo,
} from "@/types/Todo.type";

type GraphqlTodo =
  | CreateTodoMutation["createTodo"]
  | TodoQuery["todo"]
  | UpdateTodoMutation["updateTodo"]
  | TodosQuery["todos"]["data"][number];

function toTodo(todo: GraphqlTodo): Todo {
  return {
    ...todo,
  };
}

const defaultPagination = {
  currentPage: 1,
  limit: 10,
  orderBy: "DESC",
} as const;

export function isTodoUnavailableError(
  error: unknown,
): error is GraphqlApiError {
  if (!error || typeof error !== "object") {
    return false;
  }

  const graphqlError = error as Partial<GraphqlApiError>;

  return graphqlError.status === 404
    || graphqlError.code === "NOT_FOUND"
    || graphqlError.code === "TODO_NOT_FOUND"
    || graphqlError.code === "FORBIDDEN";
}

export const todoApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: build => ({
    createTodo: build.mutation<Todo, AddTodo>({
      query: input => ({
        document: CreateTodoDocument,
        variables: {
          input: input satisfies CreateTodoMutationVariables["input"],
        },
      }),
      transformResponse: (response: CreateTodoMutation) =>
        toTodo(response.createTodo),
      invalidatesTags: result =>
        result ? [{ type: "todos", id: "LIST" }] : [],
    }),
    listTodos: build.query<PaginatedTodo, TodoPagination | void>({
      query: pagination => {
        const variables = {
          pagination: {
            currentPage: pagination?.currentPage ?? defaultPagination.currentPage,
            limit: pagination?.limit ?? defaultPagination.limit,
            orderBy: pagination?.orderBy ?? defaultPagination.orderBy,
            ...(pagination?.total === undefined
              ? {}
              : { total: pagination.total }),
          },
        } satisfies TodosQueryVariables;

        return {
          document: TodosDocument,
          variables,
        };
      },
      transformResponse: (response: TodosQuery) => ({
        ...response.todos,
        data: response.todos.data.map(toTodo),
      }),
      providesTags: result => [
        { type: "todos", id: "LIST" },
        ...(result?.data.map(({ id }) => ({ type: "todos" as const, id })) ?? []),
      ],
    }),
    getTodo: build.query<Todo, string>({
      query: id => ({
        document: TodoDocument,
        variables: { id },
      }),
      transformResponse: (response: TodoQuery) => toTodo(response.todo),
      providesTags: (result, _error, id) =>
        result ? [{ type: "todos", id }] : [],
    }),
    updateTodo: build.mutation<Todo, UpdateTodo>({
      query: ({ id, input }) => ({
        document: UpdateTodoDocument,
        variables: {
          id,
          input,
        } satisfies UpdateTodoMutationVariables,
      }),
      transformResponse: (response: UpdateTodoMutation) =>
        toTodo(response.updateTodo),
      invalidatesTags: (result, _error, { id }) =>
        result
          ? [
              { type: "todos", id },
              { type: "todos", id: "LIST" },
            ]
          : [],
    }),
    deleteTodo: build.mutation<boolean, string>({
      query: id => ({
        document: DeleteTodoDocument,
        variables: { id },
      }),
      transformResponse: (response: DeleteTodoMutation) => response.deleteTodo,
      invalidatesTags: (result, _error, id) => result
        ? [
            { type: "todos", id },
            { type: "todos", id: "LIST" },
          ]
        : [],
    }),
  }),
});

export const {
  useCreateTodoMutation,
  useDeleteTodoMutation,
  useGetTodoQuery,
  useListTodosQuery,
  useUpdateTodoMutation,
} = todoApi;
