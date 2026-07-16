export const activeUser = {
  email: "person@example.com",
  emailVerifiedAt: "2026-01-01T00:00:00.000Z",
  id: "6fffb4d8-ae0a-42bc-8154-80a118b36644",
  status: "ACTIVE" as const,
  username: "person",
};

export const pendingUser = {
  email: "pending@example.com",
  emailVerifiedAt: null,
  id: "7aaac4e9-bf1b-53cd-9265-91b229c47755",
  status: "PENDING_VERIFICATION" as const,
  username: "pending",
};

export const suspendedUser = {
  email: "suspended@example.com",
  emailVerifiedAt: "2026-01-01T00:00:00.000Z",
  id: "8bbbd5fa-cg2c-64de-a376-a2c33ad58866",
  status: "SUSPENDED" as const,
  username: "suspended",
};

export const profile = {
  ...activeUser,
  birthdate: "1990-01-01T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  lastName: "Example",
  name: "Pat",
  profilePicture: null,
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export type TodoRecord = {
  createdAt: string;
  description: string;
  done: boolean;
  dueTo: string | null;
  id: string;
  reminderOn: string | null;
  title: string;
  updatedAt: string;
};

export const seedTodos: TodoRecord[] = [
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
    description: "Document the authentication migration.",
    done: true,
    dueTo: null,
    reminderOn: null,
    createdAt: "2026-07-11T12:00:00.000Z",
    updatedAt: "2026-07-12T12:00:00.000Z",
  },
];

export const credentials = {
  active: { identifier: "person", password: "password123" },
  pending: { identifier: "pending", password: "password123" },
  suspended: { identifier: "suspended", password: "password123" },
  invalid: { identifier: "person", password: "wrong-password" },
};

type AuthPayloadUser = {
  email: string;
  emailVerifiedAt: string | null;
  id: string;
  status: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED";
  username: string;
};

export const authPayload = (user: AuthPayloadUser) => ({
  accessToken: "e2e-access-token",
  expiresIn: 3600,
  id: "auth-session-id",
  refreshToken: "e2e-refresh-token",
  user,
});
