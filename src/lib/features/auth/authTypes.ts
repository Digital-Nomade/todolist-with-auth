import type { UserStatus } from "@/gql/graphql";

export interface AuthUser {
  email: string;
  emailVerifiedAt: string | null;
  id: string;
  status: UserStatus;
  username: string;
}

export interface AuthData {
  initialized: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
}

export interface LoginAccountPayload {
  identifier: string;
  password: string;
}
