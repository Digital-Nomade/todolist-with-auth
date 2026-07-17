import type { AppDispatch } from "@/lib/store";
import type { AddTodo, Todo, UpdateTodo } from "@/types/Todo.type";
import { todoApi } from "../todoApi";

export interface TodoRemoteClient {
  create(input: AddTodo, idempotencyKey: string): Promise<Todo>;
  delete(serverId: string): Promise<void>;
  listAll(): Promise<Todo[]>;
  update(serverId: string, input: UpdateTodo["input"]): Promise<Todo>;
}

export function createTodoRemoteClient(dispatch: AppDispatch): TodoRemoteClient {
  return {
    async create(input, idempotencyKey) {
      return dispatch(todoApi.endpoints.createTodo.initiate({
        idempotencyKey,
        input,
      })).unwrap();
    },
    async delete(serverId) {
      await dispatch(todoApi.endpoints.deleteTodo.initiate(serverId)).unwrap();
    },
    async listAll() {
      const todos: Todo[] = [];
      const limit = 50;
      let currentPage = 1;

      while (true) {
        const request = dispatch(todoApi.endpoints.listTodos.initiate(
          { currentPage, limit, total: true },
          { forceRefetch: true },
        ));
        const page = await request.unwrap();
        request.unsubscribe();
        todos.push(...page.data);

        if (page.data.length < limit || (page.total !== null && todos.length >= page.total)) {
          return todos;
        }
        currentPage += 1;
      }
    },
    async update(serverId, input) {
      return dispatch(todoApi.endpoints.updateTodo.initiate({
        id: serverId,
        input,
      })).unwrap();
    },
  };
}
