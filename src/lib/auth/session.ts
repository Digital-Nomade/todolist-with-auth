const SESSION_KEY = "todo-auth.session";
const LEGACY_REFRESH_TOKEN_KEY = "todo-auth.refresh-token";

let accessToken: string | null = null;
let accessTokenExpiresAt: number | null = null;
let sessionMetadata: SessionMetadata | null = null;
const accessTokenListeners = new Set<(token: string | null) => void>();

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

export function getAccessTokenExpiresAt() {
  return accessTokenExpiresAt;
}

export function subscribeToAccessTokenChanges(
  listener: (token: string | null) => void,
) {
  accessTokenListeners.add(listener);
  return () => accessTokenListeners.delete(listener);
}

function notifyAccessTokenChanged() {
  for (const listener of accessTokenListeners) {
    try {
      listener(accessToken);
    } catch {
      // Session rotation must not fail because a transport listener failed.
    }
  }
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
  const previousAccessToken = accessToken;
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
  accessTokenExpiresAt = Date.now() + nextSession.expiresIn * 1_000;
  sessionMetadata = nextSession;
  if (accessToken !== previousAccessToken) notifyAccessTokenChanged();
}

export function clearSession() {
  const hadAccessToken = accessToken !== null;
  accessToken = null;
  accessTokenExpiresAt = null;
  sessionMetadata = null;
  browserStorage()?.removeItem(SESSION_KEY);
  browserStorage()?.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  if (hadAccessToken) notifyAccessTokenChanged();
}
