const SESSION_KEY = "todo-auth.session";
const LEGACY_REFRESH_TOKEN_KEY = "todo-auth.refresh-token";

let accessToken: string | null = null;
let sessionMetadata: SessionMetadata | null = null;

export interface SessionTokens {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export type SessionMetadata = SessionTokens;

function browserStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  const storage = browserStorage();
  if (!storage) return sessionMetadata?.refreshToken ?? null;

  const persisted = storage.getItem(SESSION_KEY);
  if (persisted) {
    try {
      return (JSON.parse(persisted) as Pick<SessionMetadata, "refreshToken">).refreshToken;
    } catch {
      storage.removeItem(SESSION_KEY);
    }
  }

  return storage.getItem(LEGACY_REFRESH_TOKEN_KEY);
}

export function getSessionMetadata() {
  return sessionMetadata;
}

export function setSession(tokens: SessionTokens) {
  const nextSession = {
    accessToken: tokens.accessToken,
    expiresIn: tokens.expiresIn,
    refreshToken: tokens.refreshToken,
  };
  const storage = browserStorage();

  // Persistence must succeed before the in-memory access token is replaced.
  storage?.setItem(SESSION_KEY, JSON.stringify({
    refreshToken: nextSession.refreshToken,
  }));
  storage?.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  accessToken = nextSession.accessToken;
  sessionMetadata = nextSession;
}

export function clearSession() {
  accessToken = null;
  sessionMetadata = null;
  browserStorage()?.removeItem(SESSION_KEY);
  browserStorage()?.removeItem(LEGACY_REFRESH_TOKEN_KEY);
}
