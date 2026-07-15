import type { Todo } from "@/types/Todo.type";

export const sampleTodos: Todo[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Plan sprint backlog",
    description: "Review priorities with the team.",
    done: false,
    dueTo: "2026-07-20T18:00:00.000Z",
    reminderOn: "2026-07-20T09:00:00.000Z",
    createdAt: "2026-07-10T12:00:00.000Z",
    updatedAt: "2026-07-10T12:00:00.000Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Write release notes",
    description: "",
    done: true,
    dueTo: null,
    reminderOn: null,
    createdAt: "2026-07-11T12:00:00.000Z",
    updatedAt: "2026-07-12T12:00:00.000Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "Ship authentication migration",
    description: "Verify refresh rotation and route guards.",
    done: false,
    dueTo: "2026-07-25T23:59:59.000Z",
    reminderOn: null,
    createdAt: "2026-07-13T12:00:00.000Z",
    updatedAt: "2026-07-14T12:00:00.000Z",
  },
];

export const selectedTodo = sampleTodos[0];
